#include "board.h"
#include <stddef.h>
#include <stdlib.h>

/**
 * Calculate the number of descents required to process a move, i.e. the length minus one
 * 
 * @param move  The move
 * @returns     Descent count
 */
unsigned int count_descent(Move *move) {
    unsigned int count = 0;
    while (move->next) {
        move = move->next;
        count++;
    }
    return count;
}

/**
 * Descend to the indicated child node, creating it if it doesn't exist.
 * 
 * @param parent_board     A pointer to the parent board
 * @param position  The coordinate of the child within the parent
 * @returns         A pointer to the board at that location
 */
Board *descend(Board *parent_board, Position position) {
    if (parent_board->cells[position]) {
        return parent_board->cells[position];
    }
    else {
        Board *child_board = calloc(1, sizeof(Board));
        child_board->parent = parent_board;
        child_board->depth = parent_board->depth - 1;
        child_board->state[0] = position;
        parent_board->cells[position] = child_board;
        return child_board;
    }
}


/**
 * Internal API for retrieving the state of a board position
 * 
 * @param board     A pointer to the board with the desired state
 * @param position  The coordinate of the desired state
 * @returns         The player or players occupying that position
 */
Verdict retrieve_cell(Board *board, Position position) {
    if (position == 0) {
        return (board->state[0] >> X_OFFSET + position & 0b1) | (board->state[1] >> O_OFFSET + position - 8 & 0b1) << 1;
    }
    if (position == 1) {
        return (board->state[0] >> X_OFFSET + position & 0b1) | (board->state[2] >> O_OFFSET + position - 16 & 0b1) << 1;
    }
    return (board->state[1] >> X_OFFSET + position - 8 & 0b1) | (board->state[2] >> O_OFFSET + position - 16 & 0b1) << 1;
}

int move_lookahead(Board *board, Move move) {
    if (board->cells[move.coordinate]) {
        board = board->cells[move.coordinate];
        move = *move.next;
    }
    else if (retrieve_cell(board, move.coordinate)) {

    }
}

/**
 * Process a move from a client, update the gamestate, and return information about the updated gamestate
 * 
 * @param board   A pointer to the top-level board
 * @param move    The player's move
 * @param player  The player makign the move
 * @returns       A struct encoding movement success, as well as location and content of largest update
 */
Update process_move(Board *board, Move *move, Verdict player) {
    if (count_descent(move) != board->depth) {
        Update return_value = {0, {0, NULL}, EMPTY};
        return return_value;
    }
    if (0) {

    }
    if (board->depth > 0) {

    }
}

/** 
 * Retrieve the state of the board centered on a sub-board up to a certain depth
 * 
 * @param world     A pointer to the top-level board
 * @param location  The coordinates leading to the desired sub-board
 * @param depth     The number of layers downwards to retrive
 * @returns         A Board object containing the desired state.
 */
Board retrieve_state(Board *world, Move *location, unsigned int depth) {

}