testing: testing.o board.o
	gcc testing.o board.o -o testing

testing.o: testing.c lib/board.h
	gcc -g3 -c testing.c

board.o: lib/board.c
	gcc -g3 -c lib/board.c

clean:
	rm *.o testing