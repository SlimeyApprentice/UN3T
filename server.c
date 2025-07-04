#include "server.h"

ServerData *init_server() {
    ServerData *server = malloc(sizeof(ServerData));
    if (!server) {
	    printf("Malloc Failed :(");
	    exit(-1);
    }
}
