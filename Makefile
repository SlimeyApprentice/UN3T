testing: testing.o board.o
	gcc testing.o board.o -o testing

testing.o: testing.c
	gcc -c testing.c

board.o: lib/board.c
	gcc -c lib/board.c