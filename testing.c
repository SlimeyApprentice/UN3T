#include <stdio.h>
#include <stdlib.h>
#include "lib/board.h"

int t_count_descent() {
    Move length_zero = {0, NULL};
    if (count_descent(&length_zero) != 0) {
        printf("Move calculated as wrong length (%d, should be 0)", count_descent(&length_zero));
        return 0;
    }
    Move length_one = {0, &length_zero};
    if (count_descent(&length_one) != 1) {
        printf("Move calculated as wrong length (%d, should be 1)", count_descent(&length_one));
        return 0;
    }
    return 1;
}

int t_retrieve_cell() {
    Board *board = malloc(sizeof(Board));
    board->state[0] = 0b10000000;
    board->state[1] = 0b10110101;
    board->state[2] = 0b10011001;
    if (retrieve_cell(board, 0) != O) {
        printf("retrieve_cell returns wrong value at position 0 (%d, should be 2)", retrieve_cell(board, 0));
        return 0;
    }
    if (retrieve_cell(board, 1) != DRAW) {
        printf("retrive_cell returns wrong value at position 1 (%d, should be 3)", retrieve_cell(board, 1));
        return 0;
    }
    if (retrieve_cell(board, 2) != X) {
        printf("retrive_cell returns wrong value at position 1 (%d, should be 1)", retrieve_cell(board, 2));
        return 0;
    }
    if (retrieve_cell(board, 3) != EMPTY) {
        printf("retrive_cell returns wrong value at position 1 (%d, should be 0)", retrieve_cell(board, 3));
        return 0;
    }
    if (retrieve_cell(board, 4) != DRAW) {
        printf("retrive_cell returns wrong value at position 1 (%d, should be 3)", retrieve_cell(board, 4));
        return 0;
    }
    if (retrieve_cell(board, 5) != O) {
        printf("retrive_cell returns wrong value at position 1 (%d, should be 2)", retrieve_cell(board, 5));
        return 0;
    }
    if (retrieve_cell(board, 6) != X) {
        printf("retrive_cell returns wrong value at position 1 (%d, should be 1)", retrieve_cell(board, 6));
        return 0;
    }
    if (retrieve_cell(board, 7) != X) {
        printf("retrive_cell returns wrong value at position 1 (%d, should be 1)", retrieve_cell(board, 7));
        return 0;
    }
    if (retrieve_cell(board, 8) != O) {
        printf("retrive_cell returns wrong value at position 1 (%d, should be 2)", retrieve_cell(board, 8));
        return 0;
    }
    return 1;
}

int t_board_h() {
    int pass = 1;
    pass &= t_count_descent();
    pass &= t_retrieve_cell();
    if (pass) {
        printf("Internal board module passing\n");
    }
    return pass;
}

int main() {
    int pass = 1;
    pass &= t_board_h();
    if (pass) {
        printf("All tests passed\n");
    }
    return pass;
}