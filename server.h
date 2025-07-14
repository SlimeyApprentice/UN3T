#include "lib/board.h"
#include "lib/cJSON.h"
#include <poll.h>

#define UN3T_SERVER_PORT "8332"
#define UN3T_LISTEN_BACKLOG 8
#define READ_BUFFER_BYTES 256

typedef struct Games {
    int game_id;
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
    int buffer_size;
    int buffer_max_size;
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

typedef enum Signature {
	UN3T_SIG_NEW = 'N',
	UN3T_SIG_JOIN = 'J',
	UN3T_SIG_LEAV = 'L',
	UN3T_SIG_TURN = 'T',
	UN3T_SIG_MOVE = 'M',
	UN3T_SIG_SCAN = 'S'
} Signature;
