#ifndef BOARD_H
#define BOARD_H

typedef enum {
    ALPHA_ONE,
    BRAVO_ONE,
    CHARLIE_ONE,
    ALPHA_TWO,
    BRAVO_TWO,
    CHARLIE_TWO,
    ALPHA_THREE,
    BRAVO_THREE,
    CHARLIE_THREE,
} Position;

typedef enum {
    X,
    O,
    DRAW,
} Verdict;

typedef enum {
    BLANK,
    UNDECIDED,
    DECIDED,
} Status;

typedef struct {
    Status status;
    union {
        Board *cells[9];
        Verdict state;
    };
    int depth; //how many layers *inwards*, not outwards
} Board;

typedef struct {
    Position coordinate;
    Move *next;
} Move;

int move(Board *board, Move *move);

#endif // BOARD_H