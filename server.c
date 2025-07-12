#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <netdb.h>
#include <string.h>
#include "server.h"
#include "lib/board.h"

void flush_fds(ServerData *server) {
	free(server->pollfds);
	server->pollfds = malloc(sizeof(struct pollfd) * (server->connection_counter + 1));
	Connections *connections_ptr = server->connections_head;
	for (int i = 0; i < server->connection_counter && connections_ptr; i++, connections_ptr = connections_ptr->next) {
		server->pollfds[i].fd = connections_ptr->fd;
		server->pollfds[i].events = POLLIN;
	}
	server->pollfds[server->connection_counter].fd = server->sock_fd;
	server->pollfds[server->connection_counter].events = POLLIN;
	server->flush_needed = 0;
	return;
}
		


ServerData *init_server() {
    ServerData *server = malloc(sizeof(ServerData));
    if (!server) {
	    perror("Malloc failed while init'ing server :(\n");
	    exit(EXIT_FAILURE);
    }

    server->game_counter = 0;
    server->connection_counter = 0;
    server->games_head = NULL;
    server->connections_head = NULL;
    server->pollfds = NULL;
    server->flush_needed = 1;

    char host[256];
    if (gethostname(host, sizeof(host))) {
	    printf("gethostname failed to resolve hostname :(\n");
	    exit(EXIT_FAILURE);
    }
    printf("hostname to bind to: %s:%s\n", host, UN3T_SERVER_PORT);
    struct addrinfo hints, *result;
    memset(&hints, 0, sizeof(hints));
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_STREAM;
    if (getaddrinfo(host, UN3T_SERVER_PORT, &hints, &result)) {
	    printf("getaddrinfo failed to resolve host :(\n");
	    exit(EXIT_FAILURE);
    }
    inet_ntop(AF_INET, result, host, sizeof(host));
    
    printf("address: %s\n", host);
    server->sock_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server->sock_fd < 0) {
	    perror("socket creation failed :(\n");
	    exit(EXIT_FAILURE);
    }
    int enable = 1;
    if (setsockopt(server->sock_fd, SOL_SOCKET, SO_REUSEADDR, &enable, sizeof(enable))) {
	    perror("setsockopt failed :(\n");
	    exit(EXIT_FAILURE);
    }
    printf("Socket initialized. Binding...\n");
    if (bind(server->sock_fd, result->ai_addr, result->ai_addrlen)) {
	    perror("socket couldn't bind :(\n");
	    exit(EXIT_FAILURE);
    }
    printf("Socket bound\n");
    if (listen(server->sock_fd, UN3T_LISTEN_BACKLOG)) {
	    perror("socket couldn't listen :(\n");
	    exit(EXIT_FAILURE);
    }
    printf("Socket listening on port %s\n", UN3T_SERVER_PORT);
    return server;
}

void connect_client(ServerData *server) {
	Connections *client = malloc(sizeof(Connections));
	client->fd = accept(server->sock_fd, NULL, NULL);
	client->game_id = -1;
	client->role = EMPTY;
	client->buffer_size = 0;
	client->buffer_max_size = READ_BUFFER_BYTES;
	client->message_buffer = malloc(client->buffer_max_size);
	memset(client->message_buffer, 0, client->buffer_max_size);
	client->next = server->connections_head;
	server->connections_head = client;
	server->flush_needed = 1;
	server->connection_counter++;
	printf("%d\n", server->connection_counter);
	return;
}

void disconnect_client(ServerData *server, int fd) {
	Connections *connection = server->connections_head;
	Connections *pred = NULL;

	while (connection && connection->fd != fd) {
		pred = connection;
		connection = connection->next;
	}
	if (!connection) return;
	close(connection->fd);
	
	Games *game = server->games_head;
	while (game) {
		if (connection->role & X && game->X_fd == fd) game->X_fd = -1;
		if (connection->role & O && game->O_fd == fd) game->O_fd = -1;
		game = game->next;
	}
	if (pred) pred->next = connection->next;
	else server->connections_head = connection->next;

	free(connection->message_buffer);
	free(connection);
	server->connection_counter--;
	printf("%d\n", server->connection_counter);
	server->flush_needed = 1;
	return;
}

Connections *find_client_from_fd(Connections *head, int fd) {
	for (;head; head = head->next) {
		if (head->fd == fd) return head;
	}
	return NULL;
}

int create_game(ServerData *server, Connections *creator, int depth) {
	Games *game = malloc(sizeof(Games));
	game->game_id = server->game_counter++;
	game->X_fd = creator->fd;
	game->O_fd = -1;
	game->next = server->games_head;
	memset(&game->game, 0, sizeof(Game));
	game->game.restriction = calloc(1,1);
	game->game.turn = X;
	game->game.board.depth = depth;
	server->games_head = game;
	creator->game_id = game->game_id;
	creator->role = X;
	printf("New game created by %d of depth %u with game id %d\n", creator->fd, depth, game->game_id);
	return game->game_id;
}	

int command_length(char *buffer, int buffer_size) {
	for (int i = 0; i < buffer_size; i++) {
		if (buffer[i] == '\n') return i + 1;
	}
	return -1;
}

bool validate(char *buffer, int buffer_size, Signature sig) {
	int i = 1;
	switch (sig) {
		case UN3T_SIG_NEW:
			while (buffer[i] != ';') {
				if (buffer[i] - '0' > 9 || buffer[i] - '0' < 0) return false;
				i++;
				if (i >= buffer_size) return false;
			}
			i++;
			return true;	
		case UN3T_SIG_JOIN:
			while (buffer[i] != ';') {
				if (buffer[i] - '0' > 9 || buffer[i] - '0' < 0) return false;
				i++;
				if (i >= buffer_size) return false;
			}
			i++;
			return true;
		case UN3T_SIG_TURN:
			return true;
		case UN3T_SIG_MOVE:
			while (buffer[i] != ';') {
				if (buffer[i] - '0' > 8 || buffer[i] - '0' < 0) return false;
				i++;
				if (i >= buffer_size) return false;
			}
			return true;
		case UN3T_SIG_SCAN:
			while (buffer[i] != ';') {
				if (buffer[i] - '0' > 8 || buffer[i] - '0' < 0) return false;
				i++;
				if (i >= buffer_size) return false;
			}
			i++;
			while (buffer[i] != ';') {
				if (buffer[i] - '0' > 9 || buffer[i] - '0' < 0) return false;
				i++;
				if (i >= buffer_size) return false;
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
	if (client->game_id > 0) return -1;
	Games *game = find_game_from_id(server->games_head, game_id);
	if (!game) return -1;
	if (game->X_fd < 0) {
		game->X_fd = client->fd;
		client->game_id = game_id;
		client->role = X;
	}
	else if (game->O_fd < 0) {
		game->O_fd = client->fd;
		client->game_id = game_id;
		client->role = O;
	}
	else {
		client->game_id = game_id;
		client->role = EMPTY;
	}
	return 0;
}

/**
 * API:
 *
 * N <int string: depth>                     creates a new game, returning the game id. fails if the client is already in a game
 * J <int string: game_id>                   joins a game, fails if the game doesn't exist
 * T                                         returns the current game's current restriction and the current player as a JSON object
 * M <string: location>                      makes a move in the current game, fails if the client hasn't created or joined a game yet
 * S <string: location> <int string: depth>  scans the board at the specified location and depth steps down, and returns the contents found as a JSON object
 *
 * All strings are composed of the digits 0 through 9, (0 through 8 in the case of non-int strings), terminated by a semicolon (;). Commands are terminated by a newline (\n)
**/
void process_request(ServerData *server, Connections *client) {
	int message_size = command_length(client->message_buffer, client->buffer_size);
	if (message_size < 0) return;
	if (!validate(client->message_buffer, client->buffer_size, client->message_buffer[0])) {
		send(client->fd, "INVALID\n", 8, 0);
		goto clear;
	}
	Signature c = client->message_buffer[0];
	if (c == UN3T_SIG_NEW) {
		unsigned int depth;
		sscanf(client->message_buffer, "N%u;", &depth);
		printf("N%u;\n", depth);
		int game_id = create_game(server, client, depth);
		int length = snprintf(NULL, 0, "%u;\n", game_id);
		char *message = malloc(length+1);
		sprintf(message, "%d;\n", game_id);
		send(client->fd, message, length+1, 0);
	}
	else if (c == UN3T_SIG_JOIN) {
		int game_id;
		sscanf(client->message_buffer, "J%d;", &game_id);
		printf("J%d;\n", game_id);
		int error = join_game(server, client, game_id);
		if (error) send(client->fd, "FAILURE\n", 8, 0);
		else send(client->fd, "SUCCESS\n", 8, 0); 
	}
	else if (c == UN3T_SIG_TURN) {
		Games *game = find_game_from_id(server->games_head, client->game_id);
		if (!game) {
			send(client->fd, "FAILURE\n", 8, 0);
			goto clear;
		}
		printf("T\n");
		cJSON *data = retrieve_restriction(&game->game);
		char *message = cJSON_PrintUnformatted(data);
		send(client->fd, message, strlen(message) + 1, 0);
		free(message);
		cJSON_Delete(data);
	}
	else if (c == UN3T_SIG_MOVE) {
		Games *game = find_game_from_id(server->games_head, client->game_id);
		if (!game) {
			send(client->fd, "FAILURE\n", 8, 0);
			goto clear;
		}
		char *move;
		sscanf(client->message_buffer, "M%m[0-8];", &move);
		printf("M%s;\n",move);
		cJSON *data = process_move(&game->game, move, client->role);
		free(move);
		// TODO free up the game if it's won
		char *message = cJSON_PrintUnformatted(data);
		send(client->fd, message, strlen(message) + 1, 0);
		free(message);
		cJSON_Delete(data);
	}
	else if (c == UN3T_SIG_SCAN) {
		Games *game = find_game_from_id(server->games_head, client->game_id);
		if (!game) {
			send(client->fd, "FAILURE\n", 8, 0);
			goto clear;
		}
		char *location;
		int depth;
		sscanf(client->message_buffer, "S%m[0-8];%d;", &location, &depth);
		printf("S%s;%d;\n", location, depth);
		cJSON *data = retrieve_state(&game->game, location, depth);

	}
	clear:
	memmove(client->message_buffer, client->message_buffer + message_size, client->buffer_size - message_size);
	client->buffer_size -= message_size;
	return;
}

void receive_client_data(ServerData *server, Connections *client) {
	char buffer[READ_BUFFER_BYTES];
	int bytes_read = recv(client->fd, buffer, READ_BUFFER_BYTES, 0);
	if (bytes_read < 1) {
		disconnect_client(server, client->fd);
		return;
	}
	while (client->buffer_size + bytes_read > client->buffer_max_size) {
		client->buffer_max_size	*= 2;
		char *new_buffer = malloc(client->buffer_max_size);
		memset(new_buffer, 0, client->buffer_max_size);
		memmove(new_buffer, client->message_buffer, client->buffer_size);
		client->message_buffer = new_buffer;
	}
	memmove(client->message_buffer + client->buffer_size, buffer, bytes_read);
	client->buffer_size += bytes_read;
}

int main() {
	ServerData *server = init_server();
	printf("Server Started\n");
	while (1) {
		if (server->flush_needed) flush_fds(server);

		if (poll(server->pollfds, server->connection_counter + 1, -1) < 0) {
			perror("poll errored :(\n");
			exit(EXIT_FAILURE);
		}
		
		for (int i = 0; i < server->connection_counter; i++) {
			struct pollfd connection = server->pollfds[i];

			if (connection.revents & (POLLHUP | POLLERR)) {
				disconnect_client(server, connection.fd);
				printf("%d disconnected\n", connection.fd);
			}

			if (connection.revents & POLLIN) {
				Connections *client = find_client_from_fd(server->connections_head, connection.fd);
				receive_client_data(server, client);
				process_request(server, client);
			}
		}

		if (server->pollfds[server->connection_counter].revents & POLLIN) {
			connect_client(server);
			printf("Accepted a connection\n");
		}
	}
	return 0;
}
