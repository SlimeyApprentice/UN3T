#include "board.h"
#include <stddef.h>
#include <stdlib.h>

/**
 * Calculate the number of descents required to process a move, i.e. the length minus one
 * 
 * @param move  The move
 * @returns     Descent count
 */
unsigned int _count_descent(Move *move) {
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
Board *_descend(Board *parent_board, Position position) {
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
Verdict _retrieve_symbol(Board *board, Position position) {
    if (position == 0) {
        return (board->state[0] >> X_OFFSET + position & 0b1) | (board->state[1] >> O_OFFSET + position - 8 & 0b1) << 1;
    }
    if (position == 1) {
        return (board->state[0] >> X_OFFSET + position & 0b1) | (board->state[2] >> O_OFFSET + position - 16 & 0b1) << 1;
    }
    return (board->state[1] >> X_OFFSET + position - 8 & 0b1) | (board->state[2] >> O_OFFSET + position - 16 & 0b1) << 1;
}


/**
 * Internal API for changing the state of a board position
 * 
 * @param board     A pointer to the board the move is being made in
 * @param position  The location within the board being changes
 * @param symbol    The symbol to be written at that position
 */
void _place_symbol(Board *board, Position position, Verdict symbol) {
    if (position == 0) {
        board->state[0] &= ~(0b1 << X_OFFSET + position);
        board->state[0] |= (symbol & 0b1) << X_OFFSET + position;
        board->state[1] &= ~(0b1 << O_OFFSET + position - 8);
        board->state[1] |= (symbol >> 1 & 0b1) << O_OFFSET + position - 8;
        return;
    }
    if (position == 1) {
        board->state[0] &= ~(0b1 << X_OFFSET + position);
        board->state[0] |= (symbol & 0b1) << X_OFFSET + position;
        board->state[2] &= ~(0b1 << O_OFFSET + position - 16);
        board->state[2] |= (symbol >> 1 & 0b1) << O_OFFSET + position - 16;
        return;
    }
    board->state[1] &= ~(0b1 << X_OFFSET + position - 8);
    board->state[1] |= (symbol & 0b1) << X_OFFSET + position - 8;
    board->state[2] &= ~(0b1 << O_OFFSET + position - 16);
    board->state[2] |= (symbol >> 1 & 0b1) << O_OFFSET + position - 16;
    return;
}

/**
 * Check whether a move would place a symbol on a completed board, in order to prevent uncessesary memory allocation
 * @param board  A pointer to the board being moved in
 * @param move   The move
 * @returns      Whether the move is legal
 */
int move_lookahead(Board *board, Move *move) {
    if (board->cells[move->coordinate]) {
        board = board->cells[move->coordinate];
        move = move->next;
    }
    else if (_retrieve_symbol(board, move->coordinate)) {
        return 0;
    }
    return 1;
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
    Update fail_value = {0, {0, NULL}, EMPTY};
    if (_count_descent(move) != board->depth) {
        return fail_value;
    }
    if (!move_lookahead(board, move)) {
        return fail_value;
    }
    if (board->depth > 0) {
        board = _descend(board, move->coordinate);
        move = move->next;
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