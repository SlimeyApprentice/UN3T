#ifndef BOARD_H
#define BOARD_H

#define X_OFFSET 0x06U
#define O_OFFSET 0x0FU
#define LINE_MASK_1 = 0b111000000
#define LINE_MASK_2 = 0b000111000
#define LINE_MASK_3 = 0b000000111
#define LINE_MASK_4 = 0b100100100
#define LINE_MASK_5 = 0b010010010
#define LINE_MASK_6 = 0b001001001
#define LINE_MASK_7 = 0b100010001
#define LINE_MASK_8 = 0b001010100

typedef enum {
    ALPHA_ONE,      // 0x0
    ALPHA_TWO,      // 0x1
    ALPHA_THREE,    // 0x2
    BRAVO_ONE,      // 0x3
    BRAVO_TWO,      // 0x4
    BRAVO_THREE,    // 0x5
    CHARLIE_ONE,    // 0x6
    CHARLIE_TWO,    // 0x7
    CHARLIE_THREE,  // 0x8
} Position;

typedef enum {
    EMPTY,  // 0b00
    X,      // 0b01
    O,      // 0b10
    DRAW,   // 0b11
} Verdict;

typedef struct Board {
    struct Board *parent;
    struct Board *cells[9];
    unsigned char state[3]; // 24 bit field
    // 0x00-0x03 encode the position within the parent
    // 0x04-0x05 unused
    // 0x06-0x0D are 1 for cells owned by X
    // 0x0F-0x17 are 1 for cells owned by O
    unsigned int depth; // contains the number of steps down before hitting the bottom
} Board;

typedef struct Move {
    Position coordinate;
    struct Move *next;
} Move;

typedef struct Update {
    int successful;
    Move location;
    Verdict value;
} Update;

/**
 * Process a move from a client, update the gamestate, and return information about the updated gamestate
 * 
 * @param world   A pointer to the top-level board
 * @param move    The player's move
 * @param player  The player makign the move
 * @returns       A struct encoding movement success, as well as location and content of largest update
 */
Update process_move(Board *world, Move *move, Verdict player);

/** 
 * Retrieve the state of the board centered on a sub-board up to a certain depth
 * 
 * @param world     A pointer to the top-level board
 * @param location  The coordinates leading to the desired sub-board
 * @param depth     The number of layers downwards to retrive
 * @returns         A Board object containing the desired state.
 */
Board retrieve_state(Board *world, Move *location, unsigned int depth);

#endif // BOARD_H