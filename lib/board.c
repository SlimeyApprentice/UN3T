#include <board.h>

int move(Board *board, Move *move, Verdict player) {
    if (move->next && board->depth) {
        board = descend(board, move->coordinate);
        move = move->next;
    }
    else if (board->depth) {
        return -1;
    }
    else {
        board->cells[move->coordinate] = player;
        return 0;
    }
}