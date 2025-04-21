#ifndef BOARD_H
#define BOARD_H

typedef enum {
    ALPHA_ONE,
    ALPHA_TWO,
    ALPHA_THREE,
    BRAVO_ONE,
    BRAVO_TWO,
    BRAVO_THREE,
    CHARLIE_ONE,
    CHARLIE_TWO,
    CHARLIE_THREE,
} Position;

typedef enum {
    EMPTY,
    X,
    O,
    DRAW,
} Verdict;

typedef enum {
    BLANK,
    UNDECIDED,
    DECIDED,
} Status;

typedef struct Board {
    struct Board *parent;
    Position address;
    Status status;
    union {
        struct Board *cells[9];
        Verdict state;
    };
    int x_scores[8];
    int o_scores[8];
    int depth; //how many layers *inwards*, not outwards
} Board;

typedef struct Move {
    Position coordinate;
    struct Move *next;
} Move;

int judge(Board *board, Position play, Verdict player);

int move(Board *board, Move *move, Verdict player);

#endif // BOARD_H