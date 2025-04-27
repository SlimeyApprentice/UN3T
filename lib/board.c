#include "board.h"

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