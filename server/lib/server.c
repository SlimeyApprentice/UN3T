#ifndef _SERVER_C_
#define _SERVER_C_

#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <netdb.h>
#include <string.h>
#include <stdbool.h>
#include "server.h"
#include "board.h"

extern int GLOBAL_START_TIME;

void log_move(char *move, int game_id) {
	printf("logging\n");
	FILE *fdr = fopen("logs/games", "r");
	FILE *fdw = fopen("logs/games~", "w");
	if (!fdw) printf("Error opening Alt file\n");
	int i = 0;
	char c;
	if (fdr) {
		while ((c = fgetc(fdr)) != EOF) {
			if (c == '\n') {
				if (i == game_id) fprintf(fdw, "%s;", move);
				i++;
			}
			fputc(c, fdw);
		}
		fclose(fdr);
	}
	printf("index of last game: %d\n", i);
	if (i <= game_id) {
		for (int j = i; j < game_id; j++) {
			fputc('\n', fdw);
		}
		fprintf(fdw, "%s;\n", move);
	}
	fclose(fdw);
	rename("logs/games~", "logs/games");
}

void log_terminate(Verdict winner, int game_id) {
	char winchar = winner & 0x1 ? (winner & 0x2 ? '#' : 'X') : (winner & 0x2 ? 'O' : '_');
	printf("%c wins game %d!\n", winchar, game_id);
	FILE *fdr = fopen("logs/games", "r");
	FILE *fdw = fopen("logs/games~", "w");
	int i = 0;
	char c;
	if (game_id == 0) fputc(winchar, fdw);
	while ((c = fgetc(fdr)) != EOF) {
		fputc(c, fdw);
		if (c == '\n') {
			if (i == game_id - 1) fputc(winchar, fdw);
			i++;
		}
	}
	fclose(fdr);
	fclose(fdw);
	rename("logs/games~", "logs/games");
}

int leave_game(ServerData *server, Connections *client) {
	if (!server || !client) return -1;
	Games *game = server->games_head;
	while (game) {
		if (game->player_X == client) game->player_X = NULL;
		if (game->player_O == client) game->player_O = NULL;
		game = game->next;
	}
	client->game_id = -1;
	client->role = EMPTY;
	return 0;
}

Connections *find_client_from_id(Connections *head, int id) {
	for (;head; head = head->next) {
		if (head->user_id == id) return head;
	}
	return NULL;
}

int create_game(ServerData *server, Connections *creator, int depth) {
	if (!server || !creator) return -1;
	Games *game = malloc(sizeof(Games));
	game->game_id = server->game_counter++;
	game->player_X = creator;
	game->player_O = NULL;
	game->next = server->games_head;
	memset(&game->game, 0, sizeof(Game));
	game->game.restriction = calloc(1,1);
	game->game.turn = X;
	game->game.board.depth = depth;
	server->games_head = game;
	creator->game_id = game->game_id;
	creator->role = X;
	printf("New game created by %d of depth %u with game id %d\n", creator->user_id, depth, game->game_id);
	return game->game_id;
}	

int end_game(ServerData *server, Games* game) {
	if (!server || !game) return -1;
	if (server->games_head == game) server->games_head = game->next;
	else {
		Games *pred = server->games_head;
		while (pred->next != game && pred->next != NULL) {
			pred = pred->next;
		}
		if (pred->next == NULL) return -1;
		pred->next = game->next;
	}
	free(game->game.restriction);
	for (int i = 0; i < 9; i++) {
		destroy_board(game->game.board.cells[i]);
	}
	printf("Game over. The user wins\n");
	free(game);
}

int terminated_length(char *buffer, int buffer_size, char terminator) {
	if (!buffer) return -1;
	for (int i = 0; i < buffer_size; i++) {
		if (buffer[i] == terminator) return i + 1;
	}
	return -1;
}

bool validate(Buffer buf, Signature sig) {
	int i = 1 + LWS_PRE;
	switch (sig) {
		case UN3T_SIG_NEW:
			while (buf.contents[i] != ';') {
				if (buf.contents[i] - '0' > 9 || buf.contents[i] - '0' < 0) return false;
				i++;
				if (i >= buf.buffer_size + LWS_PRE) return false;
			}
			i++;
			return true;	
		case UN3T_SIG_JOIN:
			while (buf.contents[i] != ';') {
				if (buf.contents[i] - '0' > 9 || buf.contents[i] - '0' < 0) return false;
				i++;
				if (i >= buf.buffer_size + LWS_PRE) return false;
			}
			i++;
			if (buf.contents[i] != 'X' && buf.contents[i] != 'O' && buf.contents[i] != '#' && buf.contents[i] != '_') return false;
			return true;
		case UN3T_SIG_LEAV:
			return true;
		case UN3T_SIG_TURN:
			return true;
		case UN3T_SIG_MOVE:
			while (buf.contents[i] != ';') {
				if (buf.contents[i] - '0' > 8 || buf.contents[i] - '0' < 0) return false;
				i++;
				if (i >= buf.buffer_size + LWS_PRE) return false;
			}
			return true;
		case UN3T_SIG_SCAN:
			while (buf.contents[i] != ';') {
				if (buf.contents[i] - '0' > 8 || buf.contents[i] - '0' < 0) return false;
				i++;
				if (i >= buf.buffer_size + LWS_PRE) return false;
			}
			i++;
			while (buf.contents[i] != ';') {
				if (buf.contents[i] - '0' > 9 || buf.contents[i] - '0' < 0) return false;
				i++;
				if (i >= buf.buffer_size + LWS_PRE) return false;
			}
			return true;
		default:
			return false;
	}
}

Games *find_game_from_id(Games *head, int game_id) {
	for (;head;head = head->next) {
		if (head->game_id == game_id) return head;
	}
	return NULL;
}

int join_game(ServerData *server, Connections *client, int game_id, Verdict role) {
	if (!server || !client) return -1;
	if (game_id < 0) return -1;
	if (client->game_id > -1) return -1;
	Games *game = find_game_from_id(server->games_head, game_id);
	if (!game) return -1;
	if (!game->player_X && (role & X)) {
		game->player_X = client;
		client->game_id = game_id;
		client->role = X;
	}
	else if (!game->player_O && (role & O)) {
		game->player_O = client;
		client->game_id = game_id;
		client->role = O;
	}
	else {
		client->game_id = game_id;
		client->role = EMPTY;
	}
	return 0;
}

Buffer concat_message(Buffer buf, char *new, size_t size) {
	printf("beginning concatenation. Contents are '%.*s', length %d\n", buf.buffer_size, buf.contents + LWS_PRE, buf.buffer_size);
	if (buf.buffer_max_size < buf.buffer_size + size + LWS_PRE) {
		Buffer new_buf;
		new_buf.buffer_size = buf.buffer_size + size;
		new_buf.buffer_max_size = READ_BUFFER_BYTES;
		while (new_buf.buffer_max_size < new_buf.buffer_size + LWS_PRE) {
			new_buf.buffer_max_size *= 2;
		}
		printf("new buffer max_size is %d\n", new_buf.buffer_max_size);
		new_buf.contents = malloc(new_buf.buffer_max_size + LWS_PRE);
		memmove(new_buf.contents + LWS_PRE, buf.contents + LWS_PRE, buf.buffer_size);
		free(buf.contents);
		memmove(new_buf.contents + buf.buffer_size, new, size);
		return new_buf;
	}
	memmove(buf.contents + buf.buffer_size + LWS_PRE, new, size);
	buf.buffer_size += size;
	printf("message concatenated. The contents are now '%.*s', of length %d\n", buf.buffer_size, buf.contents + LWS_PRE, buf.buffer_size);
	return buf;
}

void queue_message(Connections *client, char *new, size_t size) {
	if (!client) return;
	client->out = concat_message(client->out, new, size);
	printf("%.*s\n", size, new);
	lws_callback_on_writable(client->wsi);
}

void pop_buffer(Buffer *buf, size_t message_length) {
	if (!buf) return;
	memmove(buf->contents + LWS_PRE, buf->contents + LWS_PRE + message_length, buf->buffer_size - message_length);
	buf->buffer_size -= message_length;
	printf("buffer popped. new contents: '%.*s', new size: %d\n", buf->buffer_size, buf->contents + LWS_PRE, buf->buffer_size);
}

void pop_plain_buffer(Buffer *buf, size_t message_length) {
	if (!buf) return;
	if (buf->buffer_size < message_length) message_length = buf->buffer_size;
	memmove(buf->contents, buf->contents + message_length, buf->buffer_size - message_length);
	buf->buffer_size -= message_length;
	printf("plain buffer popped. new contents: '%.*s', new size: %d\n", buf->buffer_size, buf->contents, buf->buffer_size);
}

void read_line_from_file_into_buffer(Buffer *buf, FILE *fdr) {
	char bus[READ_BUFFER_BYTES];
	while (terminated_length(buf->contents, buf->buffer_size, '\n') < 0 && fgets(bus, sizeof bus, fdr)) {
		if (buf->buffer_max_size < buf->buffer_size + sizeof bus) {
			buf->buffer_max_size *= 2;
			buf->contents = realloc(buf->contents, buf->buffer_max_size);
		}
		strcat(buf->contents, bus);
		buf->buffer_size += strlen(bus);
	}
}

void rewind_games(ServerData *server) {
	int game_id = 0;
	Games *current_game = NULL;
	Buffer game_string;
	game_string.contents = calloc(1, 256);
	game_string.buffer_size = 1;
	game_string.buffer_max_size = 256;
	FILE *fdr = fopen("logs/games", "r");
	read_line_from_file_into_buffer(&game_string, fdr);
	printf("%s\n", game_string.contents);
	while (game_string.buffer_size != 1) {
		if (game_string.contents[0] == '_' || game_string.contents[0] == 'X' || game_string.contents[0] == 'O' || game_string.contents[0] == '#') {
			game_id++;
			pop_plain_buffer(&game_string, game_string.buffer_size);
			game_string.buffer_size = 1;
			game_string.contents[0] = 0;
			read_line_from_file_into_buffer(&game_string, fdr);
			continue;
		}
		int depth = terminated_length(game_string.contents, game_string.buffer_size, ';') - 2;
		printf("Depth: %d\n", depth);
		if (depth < 0) {
			game_id++;
			pop_plain_buffer(&game_string, game_string.buffer_size);
			game_string.buffer_size = 1;
			game_string.contents[0] = 0;
			read_line_from_file_into_buffer(&game_string, fdr);
			continue;
		}
		Games *new_game = calloc(1, sizeof(Games));
		new_game->next = current_game;
		current_game = new_game;
		current_game->game_id = game_id;
		current_game->game.turn = X;
		current_game->game.board.depth = depth;
		current_game->game.restriction = calloc(1,1);
		Verdict current_player = X;
		while(game_string.buffer_size > depth) {
			game_string.contents[depth+1] = 0;
			printf("Move: %s\n", game_string.contents);
			cJSON_Delete(process_move(&current_game->game, game_string.contents, current_player));
			pop_plain_buffer(&game_string, depth+2);
			current_player ^= DRAW;
		}
		printf("Recovered game with ID %d\n", game_id);
		game_id++;
		pop_plain_buffer(&game_string, game_string.buffer_size);
		game_string.buffer_size = 1;
		game_string.contents[0] = 0;
		read_line_from_file_into_buffer(&game_string, fdr);
	}
	server->games_head = current_game;
	server->game_counter = game_id;
	free(game_string.contents);
}

/*
 * API:
 *
 * N <int string: depth>                     creates a new game, returning the game id. fails if the client is already in a game
 * J <int string: game_id> <_, X, O, or #>      joins a game as player specified, with the server choosing if # is specified. if the spot is occupied, joins as a spectator. fails if the game doesn't exist
 * L                                         leaves the current game
 * T                                         returns the current game's current restriction and the current player as a JSON object
 * M <string: location>                      makes a move in the current game, fails if the client hasn't created or joined a game yet
 * S <string: location> <int string: depth>  scans the board at the specified location and depth steps down, and returns the contents found as a JSON object
 *
 * All strings are composed of the digits 0 through 9, (0 through 8 in the case of non-int strings), terminated by a semicolon (;). Commands are terminated by a newline (\n).
**/
void process_request(ServerData *server, Connections *client) {
	if (!server || !client) return;

	Buffer *buf_in = &client->in;
	char signature = buf_in->contents[LWS_PRE];
	char *read_head = buf_in->contents + LWS_PRE;
	int read_length = buf_in->buffer_size;

	int message_size = terminated_length(read_head, read_length, '\n');
	if (message_size < 0) return;
	if (!validate(*buf_in, signature)) {
		queue_message(client, "ERR:SYNTAX\n", 11);
		pop_buffer(buf_in, message_size);
		return;
	}
	read_head[message_size - 1] = 0;
	printf("%s\n", read_head);
	Signature c = read_head[0];
	read_head++;
	read_length--;
	if (c == UN3T_SIG_NEW) {
		queue_message(client, "N", 1);
		int term_size = terminated_length(read_head, read_length, ';');
		read_head[term_size - 1] = 0;
		printf("%s\n", read_head);
		unsigned int depth = 0;
		if (sscanf(read_head, "%u", &depth) != 1) {
			queue_message(client, "ERR:NUM\n", 8);
			pop_buffer(buf_in, message_size);
			return;
		}
		int game_id = create_game(server, client, depth);
		int length = snprintf(NULL, 0, "%u;\n", game_id);
		char *message = (char*)malloc(length+1);
		sprintf(message, "%d;\n", game_id);
		queue_message(client, message, length+1);
		free(message);
	}
	else if (c == UN3T_SIG_JOIN) {
		queue_message(client, "J", 1);
		int term_size = terminated_length(read_head, read_length, ';');
		read_head[term_size - 1] = 0;
		printf("%s\n", read_head);
		int game_id = -1;
		if (sscanf(read_head, "%d", &game_id) != 1) {
			queue_message(client, "ERR:NUM\n", 8);
			pop_buffer(buf_in, message_size);
			return;
		}
		read_head += term_size;
		int error = join_game(server, client, game_id, (read_head[0] == '#' || read_head[0] == 'X') | ((read_head[0] == '#' || read_head[0] == 'O') << 1));
		if (error) queue_message(client, "FAILURE\n", 8);
		else queue_message(client, "SUCCESS\n", 8);	
	}
	else if (c == UN3T_SIG_LEAV) {
		queue_message(client, "L", 1);
		int error = leave_game(server, client);
		if (error) queue_message(client, "FAILURE\n", 8);
		else queue_message(client, "SUCCESS\n", 8);
	}
	else if (c == UN3T_SIG_TURN) {
		queue_message(client, "T", 1);
		Games *game = find_game_from_id(server->games_head, client->game_id);
		int term_size = terminated_length(read_head, read_length, ';');
		if (!game) {
			queue_message(client, "FAILURE\n", 8);
			pop_buffer(buf_in, message_size);
			return;
		}
		cJSON *data = retrieve_restriction(&game->game);
		cJSON_AddNumberToObject(data, "you", (game->player_X == client) ? X : ((game->player_O == client) ? O : EMPTY));
		char *message = cJSON_PrintUnformatted(data);
		queue_message(client, message, strlen(message) + 1);
		queue_message(client, "\n", 1);
		free(message);
		cJSON_Delete(data);
	}
	else if (c == UN3T_SIG_MOVE) {
		queue_message(client, "M", 1);
		Games *game = find_game_from_id(server->games_head, client->game_id);
		int term_size = terminated_length(read_head, read_length, ';');
		if (!game) {
			queue_message(client, "FAILURE\n", 8);
			pop_buffer(buf_in, message_size);
			return;
		}
		read_head[term_size - 1] = 0;
		printf("%s\n", read_head);
		char *move = NULL;
		sscanf(read_head, "%m[0-8]", &move);
		if (!move) move = calloc(1, 1);
		char *saved_move = malloc(strlen(move) + 1);
		strcpy(saved_move, move);
		cJSON *data = process_move(&game->game, move, client->role);
		printf("%s", move);
		free(move);
		char *message = cJSON_PrintUnformatted(data);
		if (cJSON_IsTrue(cJSON_GetObjectItem(data, "success"))) {
			for (Connections *head = server->connections_head;head;head = head->next) {
				if (head->game_id == game->game_id) {
					if (head != client) {
						queue_message(head, "M", 1);
					}
					queue_message(head, message, strlen(message) + 1);
					queue_message(head, "\n", 1);
				}
			}
			log_move(saved_move, game->game_id);
			const cJSON *location = cJSON_GetObjectItemCaseSensitive(data, "location");
			if (cJSON_IsString(location) && (location->valuestring != NULL) && strlen(location->valuestring) == 0) {
				const cJSON *winner = cJSON_GetObjectItemCaseSensitive(data, "value");
				log_terminate(winner->valuedouble, game->game_id);
				end_game(server, game);
			}
		}
		else {
			queue_message(client, message, strlen(message) + 1);	
			queue_message(client, "\n", 1);
		}
		free(saved_move);
		free(message);
		cJSON_Delete(data);
	}
	else if (c == UN3T_SIG_SCAN) {
		queue_message(client, "S", 1);
		Games *game = find_game_from_id(server->games_head, client->game_id);
		int term_size = terminated_length(read_head, read_length, ';');
		if (!game) {
			queue_message(client, "FAILURE\n", 8);
			pop_buffer(buf_in, message_size);
			return;
		}
		read_head[term_size - 1] = 0;
		printf("%s\n", read_head);
		char *location;
		sscanf(read_head, "%m[0-8]", &location);
		if (!location) location = calloc(1, 1);
		read_head += term_size;
		read_length -= term_size;

		//Not sure if defining length again is necessary, but just in case
		int new_term_size = terminated_length(read_head, read_length, ';');
		int depth = 0;
		if (sscanf(read_head, "%d", &depth) != 1) {
			queue_message(client, "ERR:NUM\n", 8);
			pop_buffer(buf_in, message_size);
			return;
		}
		cJSON *data = retrieve_state(&game->game, location, depth);
		free(location);
		char *message = cJSON_PrintUnformatted(data);
		queue_message(client, message, strlen(message) + 1);
		queue_message(client, "\n", 1);
		free(message);
		cJSON_Delete(data);
	}
	pop_buffer(buf_in, message_size);
	return;
}

int handle_callback(struct lws *wsi, enum lws_callback_reasons reason, void *user, void *in, size_t len) {
	Connections *client = user;
	ServerData *server = lws_protocol_vh_priv_get(lws_get_vhost(wsi), lws_get_protocol(wsi));
	
	printf("reason: %d\n", reason);

	switch (reason) {
		case LWS_CALLBACK_PROTOCOL_INIT:
			ServerData *init_server = lws_protocol_vh_priv_zalloc(lws_get_vhost(wsi), lws_get_protocol(wsi), sizeof(ServerData));
			init_server->context = lws_get_context(wsi);
			init_server->protocol = lws_get_protocol(wsi);
			init_server->vhost = lws_get_vhost(wsi);

			if (!init_server) {
				lwsl_err("ERROR allocating serverdata\n");	
				return -1;
			}

			rewind_games(init_server);
			break;
		case LWS_CALLBACK_ESTABLISHED:
			lws_ll_fwd_insert(client, next, server->connections_head);
			client->wsi = wsi;
			client->user_id = server->connection_counter++;
			client->game_id = -1;
			client->role = EMPTY;
			Buffer client_in;
			client_in.contents = malloc(READ_BUFFER_BYTES + LWS_PRE);
			client_in.buffer_size = 0;
			client_in.buffer_max_size = READ_BUFFER_BYTES;
			client->in = client_in;
			Buffer client_out;
			client_out.contents = malloc(READ_BUFFER_BYTES + LWS_PRE);
			client_out.buffer_size = 0;
			client_out.buffer_max_size = READ_BUFFER_BYTES;
			client->out = client_out;
			break;
		case LWS_CALLBACK_CLOSED:
			free(client->in.contents);
			free(client->out.contents);
			leave_game(server, client);
			lws_ll_fwd_remove(Connections, next, client, server->connections_head);
			break;
		case LWS_CALLBACK_SERVER_WRITEABLE:
			int m = lws_write(wsi, client->out.contents + LWS_PRE, client->out.buffer_size, LWS_WRITE_TEXT);
			if (m < client->out.buffer_size) {
				lwsl_err("ERROR %d writing to ws\n", m);
				return -1;
			}
			client->out.buffer_size = 0;
			break;
		case LWS_CALLBACK_RECEIVE:
			client->in = concat_message(client->in, in, len);
			printf("client message: '%.*s', length %d\n", client->in.buffer_size, client->in.contents + LWS_PRE, client->in.buffer_size);
			while (terminated_length(client->in.contents + LWS_PRE, client->in.buffer_size, '\n') > 0) {
				printf("processing request\n");
				process_request(server, client);
				printf("request processed\n");
			}
			break;
		default:
			break;
	}

	return 0;
}
#endif // _SERVER_C_
