#include "board.h"
#include <stddef.h>
#include <stdlib.h>

/**
 * @param move   A pointer to the move to be copied
 * @param depth  How many entries to copy (or 0, to copy all)
 * @returns      A Move object with the same data as the input Move up to the specified depth
 */
Move _copy_move(Move *move, unsigned int depth) {
    Move head = {move->coordinate};
    // TODO
}


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
int _move_lookahead(Board *board, Move *move) {
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
 * Determine when one or both players have won a board
 * 
 * @param board  A pointer to the board being judged
 * @returns      The winner (EMPTY if neither player has won)
 */
Verdict _judge_board(Board *board) {
    int x_state = (board->state[0] >> X_OFFSET | board->state[1] << 8 - X_OFFSET) & 0b111111111;
    int o_state = (board->state[1] >> O_OFFSET - 8 | board->state[2] << 16 - O_OFFSET) & 0b111111111;
    int states[2] = {x_state, o_state};
    Verdict winner = EMPTY;
    for (int i = 0; i < 2; i++) {
        if ((LINE_MASK_1 & states[i]) == LINE_MASK_1) winner |= 0b1 << i;
        if ((LINE_MASK_2 & states[i]) == LINE_MASK_2) winner |= 0b1 << i;
        if ((LINE_MASK_3 & states[i]) == LINE_MASK_3) winner |= 0b1 << i;
        if ((LINE_MASK_4 & states[i]) == LINE_MASK_4) winner |= 0b1 << i;
        if ((LINE_MASK_5 & states[i]) == LINE_MASK_5) winner |= 0b1 << i;
        if ((LINE_MASK_6 & states[i]) == LINE_MASK_6) winner |= 0b1 << i;
        if ((LINE_MASK_7 & states[i]) == LINE_MASK_7) winner |= 0b1 << i;
        if ((LINE_MASK_8 & states[i]) == LINE_MASK_8) winner |= 0b1 << i;
    }
    return winner;
}


/**
 * Process a move from a client, update the gamestate, and return information about the updated gamestate
 * 
 * @param board   A pointer to the top-level board
 * @param move    The player's move
 * @param player  The player makign the move
 * @returns       A struct encoding movement success, as well as location and content of largest update
 */
Update process_move(Game *world, Move *move, Verdict player) {
    Board *board = &world->board;
    // TODO: Ensure move is in the correct small board by comparing to previous move
    Update fail_value = FAIL_UPDATE;
    if (_count_descent(move) != board->depth) {
        return fail_value;
    }
    if (!_move_lookahead(board, move)) {
        return fail_value;
    }
    while (board->depth > 0) {
        board = _descend(board, move->coordinate);
        move = move->next;
    }
    _place_symbol(board, move->coordinate, player);
    int judgement = player;
    while (judgement) {
        judgement = _judge_board(board);
        if (judgement) {
            Position location = board->state[0] & PARENT_LOCATION_MASK;
            if (board->parent) {
                board = board->parent;
                _place_symbol(board, location, judgement);
                free(board->cells[location]);
                continue;
            }
            Update return_value = FINALE_UPDATE;
            return return_value;
        }
        // return the correct value
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