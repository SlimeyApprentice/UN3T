#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/socket.h>
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
    printf("hostname to bind to: %s\n", host);
    struct addrinfo hints, *result;
    memset(&hints, 0, sizeof(hints));
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_STREAM;
    if (getaddrinfo(host, UN3T_SERVER_PORT, &hints, &result)) {
	    printf("getaddrinfo failed to resolve host :(\n");
	    exit(EXIT_FAILURE);
    }
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
    if (bind(server->sock_fd, result->ai_addr, result->ai_addrlen)) {
	    perror("socket couldn't bind :(\n");
	    exit(EXIT_FAILURE);
    }
    listen(server->sock_fd, UN3T_LISTEN_BACKLOG);

    return server;
}

void disconnect(ServerData *server, int fd) {
	Connections *connection = server->connections_head;
	Connections *pred = NULL;

	while (connection && connection->fd != fd) {
		pred = connection;
		connection = connection->next;
	}
	if (!connection) return;
	close(connection->fd);
	if (connection->game_id > -1 && connection->role > 0) {
		Games *game = server->games_head;
		Games *prev = NULL;

		while (game && game->game_id != connection->game_id) {
			prev = game;
			game = game->next;
		}

		if (connection->role & X && game->X_fd == fd) game->X_fd = -1;
		if (connection->role & O && game->O_fd == fd) game->O_fd = -1;
	}
	if (pred) pred->next = connection->next;
	else server->connections_head = connection->next;
	free(connection->message_buffer);
	free(connection);
	server->flush_needed = 1;
	return;
}

void process_request(ServerData *server, int fd) {

}

int main() {
	ServerData *server = init_server();
	while (1) {
		if (server->flush_needed) flush_fds(server);

		if (poll(server->pollfds, server->connection_counter + 1, -1) < 0) {
			perror("poll errored :(\n");
			exit(EXIT_FAILURE);
		}
		
		for (int i = 0; i < server->connection_counter; i++) {
			struct pollfd client = server->pollfds[i];

			if (client.revents & (POLLHUP | POLLERR)) {
				disconnect(server, client.fd);
			}

			if (client.revents & POLLIN) {
				process_request(server, client.fd);
			}
		}

		if (server->pollfds[server->connection_counter].revents & POLLIN) {
			printf("Accepted a connection\n");
			int fd = accept(server->sock_fd, NULL, NULL);
			char *message = "Hello! This is a placeholder.\n";
			send(fd, message, strlen(message) + 1, 0);
			close(fd);
		}
	}
	return 0;
}
