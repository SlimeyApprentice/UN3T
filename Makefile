all: testing server

server: server.o board.o cJSON.o
	gcc server.o board.o cJSON.o -o server

server.o: server.c server.h
	gcc -g3 -c server.c

testing: testing.o board.o cJSON.o
	gcc testing.o board.o cJSON.o -o testing

testing.o: testing.c lib/board.h
	gcc -g3 -c testing.c

board.o: lib/board.c lib/board.h
	gcc -g3 -c lib/board.c

cJSON.o: lib/cJSON.c lib/cJSON.h
	gcc -g3 -c lib/cJSON.c

clean:
	rm *.o testing
