#ifndef SERVER_H
#define SERVER_H

#include <libwebsockets.h>
#include "board.h"
#include "cJSON.h"

#define UN3T_SERVER_PORT 8332
#define UN3T_LISTEN_BACKLOG 8
#define READ_BUFFER_BYTES 256

typedef struct Buffer {
	char *contents; /* malloc - free */
	size_t buffer_size;
	size_t buffer_max_size;
} Buffer;

typedef struct Connections {
    struct Connections *next;
    struct lws *wsi;
    int user_id;
    int game_id;
    Verdict role;
    Buffer in; /* client-to-server */
    Buffer out; /* server-to-client */
} Connections;

typedef struct Games {
    struct Games *next;
    int game_id;
    Game game;
    Connections *player_X;
    Connections *player_O;
} Games;

typedef struct ServerData {
    struct lws_context *context;
    struct lws_vhost *vhost;
    const struct lws_protocols *protocol;

    int game_counter;
    Games *games_head;
    
    int connection_counter;
    Connections *connections_head;
} ServerData;

typedef enum Signature {
	UN3T_SIG_NEW = 'N',
	UN3T_SIG_JOIN = 'J',
	UN3T_SIG_LEAV = 'L',
	UN3T_SIG_TURN = 'T',
	UN3T_SIG_MOVE = 'M',
	UN3T_SIG_SCAN = 'S'
} Signature;

int handle_callback(struct lws *wsi, enum lws_callback_reasons reason, void *user, void *in, size_t len);

#define LWS_PLUGIN_PROTOCOL_MINIMAL \
{ \
	"lws-minimal", \
	handle_callback, \
	sizeof(ServerData), \
	128, \
	0, NULL, 0 \
}

#endif // SERVER_H 
