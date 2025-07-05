#include "lib/board.h"
#include "lib/cJSON.h"
#include <netinet/in.h>
#include <sys/socket.h>
#include <poll.h>

#define SERVER_PORT 8332

typedef struct Games {
    int id;
    Game game;
    int X_id;
    int O_id;
    struct Games *next;
} Games;

typedef struct Connections {
    int id;
    int sockfd;
    int game_id;
    Verdict role;
    char *message_buffer;
    struct Connections *next;
} Connections;

typedef struct ServerData {
    int server_sock_fd;
    int max_client_fd;
    int port;
    int game_counter;
    int connection_counter;
    Games *games_head;
    Connections *connections_head;
    struct sockaddr_in addr;
    struct pollfd *pollfds;
} ServerData;

ServerData *init_server();
