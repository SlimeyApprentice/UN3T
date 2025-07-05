#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netdb.h>
#include "server.h"
#include "lib/board.h"

void update_fds(ServerData *server) {
	free(server->pollfds);
	server->pollfds = malloc(sizeof(struct pollfd) * (server->connection_counter + 1));
	Connections *connections_ptr = server->connections_head;
	for (int i = 0; i < server->connection_counter && connections_ptr; i++, connections_ptr = connections_ptr->next) {
		server->pollfds[i].fd = connections_ptr->fd;
		server->pollfds[i].events = POLLIN;
	}
	server->pollfds[server->connection_counter].fd = server->sock_fd;
	server->pollfds[server->connection_counter].events = POLLIN;
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
//    char host[256];
//    if (gethostname(host, sizeof(host))) {
//	    printf("gethostname failed to resolve hostname :(\n");
//	    exit(EXIT_FAILURE);
//    }
//    printf("hostname to bind to: %s\n", host);
//    struct addrinfo *result;
//    if (getaddrinfo(host, "8332", NULL, &result)) {
//	    printf("getaddrinfo failed to resolve host :(\n");
//	    exit(EXIT_FAILURE);
//    }
    server->sock_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server->sock_fd < 0) {
	    perror("socket creation failed :(\n");
	    exit(EXIT_FAILURE);
    }
    int enable = 1;
    if (setsockopt(server->sock_fd, SOL_SOCKET, SO_REUSEADDR, &enable, sizeof(enable)));
    struct sockaddr_in addr;
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(UN3T_SERVER_PORT);
    if (bind(server->sock_fd, (const struct sockaddr *) &addr, sizeof(addr))) {
	    perror("socket couldn't bind to port 8332 :(\n");
	    exit(EXIT_FAILURE);
    }
    listen(server->sock_fd, UN3T_LISTEN_BACKLOG);
    return server;
}

int main() {
	ServerData *server = init_server();
	return 0;
}
