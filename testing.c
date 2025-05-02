#include <stdio.h>
#include <stdlib.h>
#include "lib/board.h"

int t_count_descent() {
    Move length_zero = {0, NULL};
    if (_count_descent(&length_zero) != 0) {
        printf("count_descent calculated move as wrong length (%d, should be 0)\n", _count_descent(&length_zero));
        return 0;
    }
    Move length_one = {0, &length_zero};
    if (_count_descent(&length_one) != 1) {
        printf("count_descent calculated move as wrong length (%d, should be 1)\n", _count_descent(&length_one));
        return 0;
    }
    return 1;
}

int t_retrieve_symbol() {
    Board *board = malloc(sizeof(Board));
    board->state[0] = 0b10000000;
    board->state[1] = 0b10110101;
    board->state[2] = 0b10011001;
    if (_retrieve_symbol(board, 0) != O) {
        printf("retrieve_cell returns wrong value at position 0 (%d, should be %d)\n", _retrieve_symbol(board, 0), O);
        free(board);
        return 0;
    }
    if (_retrieve_symbol(board, 1) != DRAW) {
        printf("retrive_cell returns wrong value at position 1 (%d, should be %d)\n", _retrieve_symbol(board, 1), DRAW);
        free(board);
        return 0;
    }
    if (_retrieve_symbol(board, 2) != X) {
        printf("retrive_cell returns wrong value at position 2 (%d, should be %d)\n", _retrieve_symbol(board, 2), X);
        free(board);
        return 0;
    }
    if (_retrieve_symbol(board, 3) != EMPTY) {
        printf("retrive_cell returns wrong value at position 3 (%d, should be %d)\n", _retrieve_symbol(board, 3), EMPTY);
        free(board);
        return 0;
    }
    if (_retrieve_symbol(board, 4) != DRAW) {
        printf("retrive_cell returns wrong value at position 4 (%d, should be %d)\n", _retrieve_symbol(board, 4), DRAW);
        free(board);
        return 0;
    }
    if (_retrieve_symbol(board, 5) != O) {
        printf("retrive_cell returns wrong value at position 5 (%d, should be %d)\n", _retrieve_symbol(board, 5), O);
        free(board);
        return 0;
    }
    if (_retrieve_symbol(board, 6) != X) {
        printf("retrive_cell returns wrong value at position 6 (%d, should be %d)\n", _retrieve_symbol(board, 6), X);
        free(board);
        return 0;
    }
    if (_retrieve_symbol(board, 7) != X) {
        printf("retrive_cell returns wrong value at position 7 (%d, should be %d)\n", _retrieve_symbol(board, 7), X);
        free(board);
        return 0;
    }
    if (_retrieve_symbol(board, 8) != O) {
        printf("retrive_cell returns wrong value at position 8 (%d, should be %d)\n", _retrieve_symbol(board, 8), O);
        free(board);
        return 0;
    }
    free(board);
    return 1;
}

int t_place_symbol() {
    Board *board = malloc(sizeof(Board));
    _place_symbol(board, 3, DRAW);
    if (_retrieve_symbol(board, 3) != DRAW) {
        printf("symbol placement failed, retrieve_cell returns value %d (should be %d)", _retrieve_symbol(board, 3), DRAW);
        free(board);
        return 0;
    }
    _place_symbol(board, 7, O);
    if (_retrieve_symbol(board, 7) != O) {
        printf("symbol placement failed, retrieve_cell returns value %d (should be %d)", _retrieve_symbol(board, 7), O);
        free(board);
        return 0;
    }
    _place_symbol(board, 8, DRAW);
    if (_retrieve_symbol(board, 8) != DRAW) {
        printf("symbol placement failed, retrieve_cell returns value %d (should be %d)", _retrieve_symbol(board, 8), DRAW);
        free(board);
        return 0;
    }
    _place_symbol(board, 3, EMPTY);
    if (_retrieve_symbol(board, 3) != EMPTY) {
        printf("symbol placement failed, retrieve_cell returns value %d (should be %d)", _retrieve_symbol(board, 3), EMPTY);
        free(board);
        return 0;
    }
    return 1;
}

int t_board_h() {
    int pass = 1;
    pass &= t_count_descent();
    pass &= t_retrieve_symbol();
    pass &= t_place_symbol();
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