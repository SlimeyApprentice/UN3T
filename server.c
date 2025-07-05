#include <stdlib.h>
#include <stdio.h>
#include "server.h"

ServerData *init_server() {
    ServerData *server = malloc(sizeof(ServerData));
    if (!server) {
	    printf("Malloc failed while init'ing server :(");
	    exit(-1);
    }

}

int main() {
	ServerData *server_data = init_server();
	return 0;
}
