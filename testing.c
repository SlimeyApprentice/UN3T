#include <stdio.h>
#include <stdlib.h>
#include "lib/board.h"

void pretty_print_move(Move *move) {
    while (move->next) {
        printf("%d", move->coordinate);
        move = move->next;
    }
}

void not_so_pretty_print_board(Board *board) {
    printf("{");
    for (int i=0;i<9;i++) {
        printf("%d",_retrieve_symbol(board, i));
        if (i % 3 == 2) {
            printf("\n");
        }
    }
    for (int i=0;i<9;i++) {
        if (board->cells[i]) {
            not_so_pretty_print_board(board->cells[i]);
        }
    }
    printf("}");
}

int t_copy_move() {
    Move *move = malloc(sizeof(Move));
    move->coordinate = 2;
    Move *tail = malloc(sizeof(Move));
    move->next = tail;
    tail->coordinate = 3;
    tail->next = NULL;
    Move *new_move = _copy_move(move);
    if (new_move->coordinate != 2) {
        printf("copy_move copied a move wrong (first entry was %d, should be %d)\n", new_move->coordinate, 2);
        return 0;
    }
    if (new_move->next->coordinate != 3) {
        printf("copy_move copied a move wrong (first entry was %d, should be %d)\n", new_move->next->coordinate, 3);
        return 0;
    }
    return 1;
}

int t_clip_move() {
    Move *move = malloc(sizeof(Move));
    move->coordinate = 2;
    Move *tail = malloc(sizeof(Move));
    move->next = tail;
    tail->coordinate = 3;
    tail->next = NULL;
    _clip_move(move, 0);
    if (_count_descent(move) != 0) {
        printf("clip_move clipped the move wrong (depth was %d, should be %d)\n", _count_descent(move), 0);
        return 0;
    }
    return 1;
}

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

int t_descend() {
    Game world = EMPTY_GAME(1);
    Board *child_1 = _descend(&world.board, 3);
    Board *child_2 = _descend(&world.board, 3);
    if (child_1 != child_2) {
        printf("descend creates two children with the same coordinate\n");
    }
    Board *child_3 = _descend(&world.board, 5);
    if (child_2 == child_3) {
        printf("descend conflates two children with different coordinates\n");
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

int t_judge_board() {
    Board *board = malloc(sizeof(Board));
    board->state[0] = 0b10000000;
    board->state[1] = 0b10110101;
    board->state[2] = 0b10011001;
    Verdict verdict = _judge_board(board);
    if (verdict != DRAW) {
        printf("Board judgement returns unexpected value (%d, should be %d)", verdict, DRAW);
        free(board);
        return 0;
    }
    board->state[0] = 0b10000000;
    board->state[1] = 0b10110001;
    board->state[2] = 0b10010001;
    verdict = _judge_board(board);
    if (verdict != EMPTY) {
        printf("Board judgement returns unexpected value (%d, should be %d)", verdict, EMPTY);
        free(board);
        return 0;
    }
    free(board);
    return 1;
}

int t_process_move() {
    Game game = EMPTY_GAME(1);
    not_so_pretty_print_board(&game.board);
    
    return 1;
}

int t_retrieve_state() {
    return 1;
}

int t_board_h() {
    int pass = 1;
    pass &= t_copy_move();
    pass &= t_clip_move();
    pass &= t_count_descent();
    pass &= t_descend();
    pass &= t_retrieve_symbol();
    pass &= t_place_symbol();
    pass &= t_judge_board();
    pass &= t_process_move();
    pass &= t_retrieve_state();
    if (pass) {
        printf("Board module passing\n");
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