#include "lib/board.h"
#include "lib/cJSON.h"
#include <poll.h>

#define UN3T_SERVER_PORT "8332"
#define UN3T_LISTEN_BACKLOG 8
#define READ_BUFFER_BYTES 256

struct Buffer {
	char *content;
	size_t buffer_size;
	size_t buffer_maxsize;
};

typedef struct Games {
    struct Games *next;
    int game_id;
    Game game;
    int X_fd;
    int O_fd;
} Games;

typedef struct Connections {
    struct Connections *next;
    struct lws *wsi;
    int game_id;
    Verdict role;
    struct Buffer in;
    struct Buffer out;
} Connections;

typedef struct ServerData {
    int game_counter;
    Games *games_head;
} ServerData;

typedef enum Signature {
	UN3T_SIG_NEW = 'N',
	UN3T_SIG_JOIN = 'J',
	UN3T_SIG_LEAV = 'L',
	UN3T_SIG_TURN = 'T',
	UN3T_SIG_MOVE = 'M',
	UN3T_SIG_SCAN = 'S'
} Signature;
