testing: testing.o board.o cJSON.o
	gcc testing.o board.o cJSON.o -o testing

testing.o: testing.c lib/board.h
	gcc -g3 -c testing.c

board.o: lib/board.c
	gcc -g3 -c lib/board.c

cJSON.o: lib/cJSON.c
	gcc -g3 -c lib/cJSON.c

clean:
	rm *.o testing