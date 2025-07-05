#include "lib/board.h"
#include "lib/cJSON.h"
#include <netinet/in.h>
#include <sys/socket.h>
#include <poll.h>

#define UN3T_SERVER_PORT 8332
#define UN3T_LISTEN_BACKLOG 64

typedef struct Games {
    int id;
    Game game;
    int X_fd;
    int O_fd;
    struct Games *next;
} Games;

typedef struct Connections {
    int fd;
    int game_id;
    Verdict role;
    char *message_buffer;
    struct Connections *next;
} Connections;

typedef struct ServerData {
    int sock_fd;
    int game_counter;
    int connection_counter;
    Games *games_head;
    Connections *connections_head;
    struct pollfd *pollfds;
    int flush_needed;
} ServerData;

ServerData *init_server();
