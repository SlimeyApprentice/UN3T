all: testing main

main: cJSON.o board.o server.o main.o 
	gcc -lwebsockets -Werror=return-type cJSON.o board.o server.o main.o -o main 

main.o: main.c
	gcc -g3 -c main.c

server.o: lib/server.c lib/server.h
	gcc -g3 -c lib/server.c

testing: testing.o board.o cJSON.o
	gcc testing.o board.o cJSON.o -o testing

testing.o: testing.c lib/board.h
	gcc -g3 -c testing.c

board.o: lib/board.c lib/board.h
	gcc -g3 -c lib/board.c

cJSON.o: lib/cJSON.c lib/cJSON.h
	gcc -g3 -c lib/cJSON.c

clean:
	rm ./*.o testing
