testing: testing.o board.o
	gcc testing.o board.o -o testing

testing.o: testing.c lib/board.h
	gcc -c testing.c

board.o: lib/board.c
	gcc -c lib/board.c

clean:
	rm *.o testing