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

int leave_game(ServerData *server, Connections *client) {
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

int terminated_length(char *buffer, int buffer_size, char terminator) {
	for (int i = 0; i <= buffer_size; i++) {
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
				if (i >= buf.buffer_size) return false;
			}
			i++;
			return true;	
		case UN3T_SIG_JOIN:
			while (buf.contents[i] != ';') {
				if (buf.contents[i] - '0' > 9 || buf.contents[i] - '0' < 0) return false;
				i++;
				if (i >= buf.buffer_size) return false;
			}
			i++;
			return true;
		case UN3T_SIG_LEAV:
			return true;
		case UN3T_SIG_TURN:
			return true;
		case UN3T_SIG_MOVE:
			while (buf.contents[i] != ';') {
				if (buf.contents[i] - '0' > 8 || buf.contents[i] - '0' < 0) return false;
				i++;
				if (i >= buf.buffer_size) return false;
			}
			return true;
		case UN3T_SIG_SCAN:
			while (buf.contents[i] != ';') {
				if (buf.contents[i] - '0' > 8 || buf.contents[i] - '0' < 0) return false;
				i++;
				if (i >= buf.buffer_size) return false;
			}
			i++;
			while (buf.contents[i] != ';') {
				if (buf.contents[i] - '0' > 9 || buf.contents[i] - '0' < 0) return false;
				i++;
				if (i >= buf.buffer_size) return false;
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

int join_game(ServerData *server, Connections *client, int game_id) {
	if (game_id < 0) return -1;
	if (client->game_id > -1) return -1;
	Games *game = find_game_from_id(server->games_head, game_id);
	if (!game) return -1;
	if (!game->player_X) {
		game->player_X = client;
		client->game_id = game_id;
		client->role = X;
	}
	else if (!game->player_O) {
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
	if (buf.buffer_max_size < buf.buffer_size + size + LWS_PRE) {
		Buffer new_buf;
		new_buf.buffer_size = buf.buffer_size + size;
		new_buf.buffer_max_size = READ_BUFFER_BYTES;
		while (new_buf.buffer_max_size < new_buf.buffer_size + LWS_PRE) {
			buf.buffer_max_size *= 2;
		}
		new_buf.contents = malloc(buf.buffer_max_size);
		memmove(new_buf.contents, buf.contents, buf.buffer_size);
		free(buf.contents);
		memmove(new_buf.contents + buf.buffer_size, new, size);
		return new_buf;
	}
	memmove(buf.contents + buf.buffer_size, new, size);
	return buf;
}

void queue_message(Connections *client, char *new, size_t size) {
	client->out = concat_message(client->out, new, size);
	lws_callback_on_writable(client->wsi);
}

void pop_buffer(Buffer buf, size_t message_length) {
	memmove(buf.contents + LWS_PRE, buf.contents + LWS_PRE + message_length, message_length);
	buf.buffer_size -= message_length;
}

/**
 * API:
 *
 * N <int string: depth>                     creates a new game, returning the game id. fails if the client is already in a game
 * J <int string: game_id>                   joins a game, fails if the game doesn't exist
 * L                                         leaves the current game
 * T                                         returns the current game's current restriction and the current player as a JSON object
 * M <string: location>                      makes a move in the current game, fails if the client hasn't created or joined a game yet
 * S <string: location> <int string: depth>  scans the board at the specified location and depth steps down, and returns the contents found as a JSON object
 *
 * All strings are composed of the digits 0 through 9, (0 through 8 in the case of non-int strings), terminated by a semicolon (;). Commands are terminated by a newline (\n).
**/
void process_request(ServerData *server, Connections *client) {
	if (!server || !client) return;

	Buffer buf_in = client->in;
	char signature = buf_in.contents[LWS_PRE];
	char *read_head = buf_in.contents + LWS_PRE;
	int read_length = buf_in.buffer_size;

	int message_size = terminated_length(read_head, read_length, '\n');
	if (message_size < 0) return;
	if (!validate(buf_in, signature)) {
		queue_message(client, "ERR:SYNTAX\n", 11);
		pop_buffer(buf_in, message_size);
	}
	read_head[message_size - 1] = 0;
	printf("%s\n", read_head);
	Signature c = read_head[0];
	read_head++;
	read_length--;
	if (c == UN3T_SIG_NEW) {
		int term_size = terminated_length(read_head, read_length, ';');
		read_head[term_size - 1] = 0;
		printf("%s\n", read_head);
		unsigned int depth = 0;
		if (sscanf(read_head, "%u", &depth) != 1) {
			queue_message(client, "ERR:NUM\n", 8);
			pop_buffer(buf_in, term_size);
		}
		int game_id = create_game(server, client, depth);
		int length = snprintf(NULL, 0, "%u;\n", game_id);
		char *message = (char*)malloc(length+1);
		sprintf(message, "%d;\n", game_id);
		queue_message(client, message, length+1);
	}
	else if (c == UN3T_SIG_JOIN) {
		int term_size = terminated_length(read_head, read_length, ';');
		read_head[term_size - 1] = 0;
		printf("%s\n", read_head);
		int game_id = -1;
		if (sscanf(read_head, "%d", &game_id) != 1) {
			queue_message(client, "ERR:NUM\n", 8);
			pop_buffer(buf_in, term_size);
		}
		int error = join_game(server, client, game_id);
		if (error) queue_message(client, "FAILURE\n", 8);
		else queue_message(client, "SUCCESS\n", 8);	
	}
	else if (c == UN3T_SIG_LEAV) {
		int error = leave_game(server, client);
		if (error) queue_message(client, "FAILURE\n", 8);
		else queue_message(client, "SUCCESS\n", 8);
	}
	else if (c == UN3T_SIG_TURN) {
		Games *game = find_game_from_id(server->games_head, client->game_id);
		int term_size = terminated_length(read_head, read_length, ';');
		if (!game) {
			queue_message(client, "FAILURE\n", 8);
			pop_buffer(buf_in, term_size);
		}
		cJSON *data = retrieve_restriction(&game->game);
		char *message = cJSON_PrintUnformatted(data);
		queue_message(client, message, strlen(message) + 1);
		free(message);
		cJSON_Delete(data);
	}
	else if (c == UN3T_SIG_MOVE) {
		Games *game = find_game_from_id(server->games_head, client->game_id);
		int term_size = terminated_length(read_head, read_length, ';');
		if (!game) {
			queue_message(client, "FAILURE\n", 8);
			pop_buffer(buf_in, term_size);
		}
		read_head[term_size - 1] = 0;
		printf("%s\n", read_head);
		char *move;
		sscanf(read_head, "%m[0-8]", &move);
		if (!move) move = calloc(1, 1);
		cJSON *data = process_move(&game->game, move, client->role);
		free(move);
		char *message = cJSON_PrintUnformatted(data);
		if (cJSON_IsTrue(cJSON_GetObjectItem(data, "success?"))) {
			// TODO free up the game if it's won
			queue_message(game->player_X, message, strlen(message) + 1);
			queue_message(game->player_O, message, strlen(message) + 1);
		}
		queue_message(client, message, strlen(message) + 1);
		free(message);
		cJSON_Delete(data);
	}
	else if (c == UN3T_SIG_SCAN) {
		Games *game = find_game_from_id(server->games_head, client->game_id);
		int term_size = terminated_length(read_head, read_length, ';');
		if (!game) {
			queue_message(client, "FAILURE\n", 8);
			pop_buffer(buf_in, term_size);
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
			queue_message(client, "ERR:NUM", 8);
			pop_buffer(buf_in, new_term_size);
		}
		cJSON *data = retrieve_state(&game->game, location, depth);
		free(location);
		char *message = cJSON_PrintUnformatted(data);
		queue_message(client, message, strlen(message) + 1);
		free(message);
		cJSON_Delete(data);
	}
	return;
}

int handle_callback(struct lws *wsi, enum lws_callback_reasons reason, void *user, void *in, size_t len) {
	Connections *client = user;
	ServerData *server = lws_protocol_vh_priv_get(lws_get_vhost(wsi), lws_get_protocol(wsi));

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
			break;
		case LWS_CALLBACK_ESTABLISHED:
			lws_ll_fwd_insert(client, next, server->connections_head);
			client->wsi = wsi;
			client->user_id = server->connection_counter++;
			client->game_id = -1;
			client->role = EMPTY;
			Buffer client_in;
			client_in.contents = malloc(READ_BUFFER_BYTES);
			client_in.buffer_size = LWS_PRE;
			client_in.buffer_max_size = READ_BUFFER_BYTES;
			client->in = client_in;
			Buffer out;
			out.contents = malloc(READ_BUFFER_BYTES);
			out.buffer_size = LWS_PRE;
			out.buffer_max_size = READ_BUFFER_BYTES;
			client->out = out;
			break;
		case LWS_CALLBACK_CLOSED:
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
			while (terminated_length(client->in.contents + LWS_PRE, client->in.buffer_size, '\n') > 0) {
				process_request(server, client);
			}
			break;
		default:
			break;
	}

	return 0;
}
// TODO: LWS_PRE more safely
#endif // _SERVER_C_
