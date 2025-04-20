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
    BLANK,
    X,
    O,
    DRAW,
} Verdict;

typedef enum {
    UNDECIDED,
    DECIDED,
} Status;

typedef struct {
    Status status;
    union {
        Board *cells[9];
        Verdict state;
    };
    int depth;
} Board;