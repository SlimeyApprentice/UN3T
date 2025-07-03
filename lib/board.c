#include "board.h"
#include <stddef.h>
#include <stdlib.h>
#include <string.h>
#include "cJSON.h"

/**
 * @param move         A pointer to a move
 * @param restriction  A pointer to another move
 * @returns            Whether both moves agree until one of them ends
 */
int _check_move_compatibility(char *move, char *restriction) {
    for (int i = 0; move[i] && restriction[i]; i++) {
        if (move[i] != restriction[i]) {
            return 0;
        }
    }
    return 1;
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
int _move_lookahead(Board *board, char *move) {
    for (int i = 0; move[i]; i++) {
        if (_retrieve_symbol(board, move[i] - '0')) {
            return 0;
        }
        if (board->cells[move[i] - '0']) {
            board = board->cells[move[i] - '0'];
            continue;
        }
        return 1;
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
 * @param board   A pointer to the game state
 * @param move    The player's move
 * @param player  The player making the move
 * @returns       A struct encoding movement success, as well as location and content of largest update
 */
cJSON *process_move(Game *world, char *move, Verdict player) {
    cJSON *root = cJSON_CreateObject();
    Board *board = &world->board;
    // Check that the right player has made the move
    if (player != world->turn) {
        cJSON_AddBoolToObject(root, "success?", cJSON_False);
        cJSON_AddNumberToObject(root, "value", -1);
        return root;
    }
    // Check the move is the correct depth
    if (strlen(move) - 1 != board->depth) {
        cJSON_AddBoolToObject(root, "success?", cJSON_False);
        cJSON_AddNumberToObject(root, "value", -2);
        return root;
    }
    for (int i = 0; move[i]; i++) {
        if (move[i] - '0' > 8 || move[i] - '0' < 0) {
            cJSON_AddBoolToObject(root, "success?", cJSON_False);
            cJSON_AddNumberToObject(root, "value", -2);
            return root;
        }
    }
    // Check that the move is not in an already won board
    if (!_move_lookahead(board, move)) {
        cJSON_AddBoolToObject(root, "success?", cJSON_False);
        cJSON_AddNumberToObject(root, "value", -3);
        return root;
    }
    // Check move is in the correct small board by comparing to restriction provided by the world
    if (!_check_move_compatibility(move, world->restriction)) {
        cJSON_AddBoolToObject(root, "success?", cJSON_False);
        cJSON_AddNumberToObject(root, "value", -4);
        return root;
    }
    // We know the move is good, so now process it
    char *saved_move = malloc(strlen(move) + 1);
    strcpy(saved_move, move);
    int i = 0;
    while (board->depth > 0) {
        board = _descend(board, move[i] - '0');
        i++;
    }
    _place_symbol(board, move[i] -'0', player);
    Verdict judgement = player;
    Verdict verdict = player;
    int depth = world->board.depth;
    while (judgement) {
        judgement = _judge_board(board);
        if (judgement) {
            verdict = judgement;
            depth--;
            Position location = board->state[0] & PARENT_LOCATION_MASK;
            if (board->parent) {
                board = board->parent;
                _place_symbol(board, location, judgement);
                free(board->cells[location]);
                continue;
            }
            cJSON_AddBoolToObject(root, "success?", cJSON_True);
            cJSON_AddStringToObject(root, "location", "");
            cJSON_AddNumberToObject(root, "value", judgement);
            cJSON_AddStringToObject(root, "restriction", "");
            return root;
            // Stop the game, because we have a winner!
            // (Deallocation is the resposiblity of the server that created the game objects)
        }
    }
    // Free the previous move restriction
    free(world->restriction);
    // Copy the move into the restriction field of the game state
    world->restriction = saved_move;
    // Zoom out until the restriction has a legal move
    while (world->restriction[0] && !_move_lookahead(&world->board, world->restriction)) {
        memmove(world->restriction, world->restriction+1, strlen(world->restriction));
    }
    // flip the player
    world->turn = DRAW - world->turn;
    // finally, clip our saved move to the right size to indicate the update
    saved_move[depth+1] = 0;
    cJSON_AddBoolToObject(root, "success?", cJSON_True);
    cJSON_AddStringToObject(root, "location", saved_move);
    cJSON_AddNumberToObject(root, "value", verdict);
    cJSON_AddStringToObject(root, "restriction", world->restriction);
    free(saved_move);
    return root;
}

cJSON *_empty_board(unsigned int depth) {
    cJSON *root = cJSON_CreateObject();
    char *key = strcpy(malloc(2), "0");
    for (int i = 0; i < 9; i++) {
        key[0] = i + '0';
        if (depth == 0) {
            cJSON_AddNumberToObject(root, key, 0);
        }
        else {
            cJSON *child = _empty_board(depth - 1);
            cJSON_AddItemToObject(root, key, child);
        }
    }
    return root;
}

cJSON *_parse_board(Board *world, unsigned int depth) {
    cJSON *root = cJSON_CreateObject();
    char *key = strcpy(malloc(2), "0");
    for (int i = 0; i < 9; i++) {
        key[0] = i + '0';
        Verdict symbol = _retrieve_symbol(world, i);
        if (depth == 0 || symbol) {
            cJSON_AddNumberToObject(root, key, symbol);
        }
        else if (!world->cells[i]) {
            cJSON *child = _empty_board(depth - 1);
            cJSON_AddItemToObject(root, key, child);
        }
        else {
            cJSON *child = _parse_board(world->cells[i], depth - 1);
            cJSON_AddItemToObject(root, key, child);
        }
    }
    return root;
}

/** 
 * Retrieve the state of the board centered on a sub-board up to a certain depth
 * 
 * @param world     A pointer to the top-level board
 * @param location  The coordinates leading to the desired sub-board
 * @param depth     The number of layers downwards to retrive
 * @returns         A Board object containing the desired state.
 */
cJSON *retrieve_state(Game *world, char *location, unsigned int depth) {
    Board *board = &world->board;
    while (location[0]) {
        board = board->cells[location[0]];
        location++;
    }
    return _parse_board(board, depth);
}