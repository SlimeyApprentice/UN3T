#ifndef BOARD_H
#define BOARD_H

#define X_OFFSET 0x06U
#define O_OFFSET 0x0FU
#define LINE_MASK_1 0b000000111
#define LINE_MASK_2 0b000111000
#define LINE_MASK_3 0b111000000
#define LINE_MASK_4 0b001001001
#define LINE_MASK_5 0b010010010
#define LINE_MASK_6 0b100100100
#define LINE_MASK_7 0b100010001
#define LINE_MASK_8 0b001010100
#define PARENT_LOCATION_MASK 0b1111
#define FAIL_UPDATE {0, {0, NULL}, EMPTY}
#define FINALE_UPDATE {1, {-1, NULL}, judgement}

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
    // offset (octal) | content
    // -----------------------
    //     000-003    | encode the position within the parent
    //     004-005    | unused
    //     006-014    | 1 for cells owned by X
    //     017-027    | 1 for cells owned by O
    unsigned int depth; // contains the number of steps down before hitting the bottom
} Board;

typedef struct Move {
    Position coordinate;
    struct Move *next;
} Move;

// typedef struct Game {
//     Board board;
//     Move restriction;
// } Game;

typedef struct Update {
    int successful;
    Move location;
    Verdict value;
} Update;

/**
 * Calculate the number of descents required to process a move, i.e. the length minus one
 * 
 * @param move  The move
 * @returns     Descent count
 */
unsigned int _count_descent(Move *move);

/**
 * Descend to the indicated child node, creating it if it doesn't exist.
 * 
 * @param parent_board     A pointer to the parent board
 * @param position  The coordinate of the child within the parent
 * @returns         A pointer to the board at that location
 */
Board *_descend(Board *parent_board, Position position);

/**
 * Internal API for retrieving the state of a board position
 * 
 * @param board     A pointer to the board with the desired state
 * @param position  The coordinate of the desired state
 * @returns         The player or players occupying that position
 */
Verdict _retrieve_symbol(Board *board, Position position);

/**
 * Internal API for changing the state of a board position
 * 
 * @param board     A pointer to the board the move is being made in
 * @param position  The location within the board being changes
 * @param symbol    The symbol to be written at that position
 */
void _place_symbol(Board *board, Position position, Verdict symbol);

/**
 * Determine when one or both players have won a board
 * 
 * @param board  A pointer to the board being judged
 * @returns      The winner (EMPTY if neither player has won)
 */
Verdict _judge_board(Board *board);

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