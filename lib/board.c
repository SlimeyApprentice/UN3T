#include "board.h"

int judge(Board *board, Position play, Verdict player) {
    while (1) {
        Verdict winner = BLANK;
        if (player == X || player == DRAW) {
            board->x_scores[play % 3] += 1;
            board->x_scores[3 + (play / 3)] += 1;
            if (play % 3 == play / 3) board->x_scores[7] += 1;
            if (play % 3 + play / 3 == 3) board->x_scores[8] += 1;
        }
        if (player == X || player == DRAW) {
            board->o_scores[play % 3] += 1;
            board->o_scores[3 + (play / 3)] += 1;
            if (play % 3 == play / 3) board->o_scores[7] += 1;
            if ((play % 3 + play / 3) == 2) board->o_scores[8] += 1;
        }
        for (int i=0; i<8; i++) {
            if (board->x_scores[i] > 3 || board->o_scores[i] > 3) {
                return 0/0;
            }
            if (board->x_scores[i] == 3) {
                winner |= X;
            }
            if (board->o_scores[i] == 3) {
                winner |= O;
            }
        }
        if (winner) {
            player = winner;
            play = board->address;
            board = board->parent;
        }
        else {
            return 0;
        }
    }
}

int move(Board *board, Move *move, Verdict player) {
    if 
    if (move->next && board->depth) {
        board = board->cells[move->coordinate];
        move = move->next;
    }
    else if (board->depth) {
        return -1;
    }
    else {
        board->cells[move->coordinate] = player;
        judge(board, move->coordinate, player);
        return 0;
    }
}