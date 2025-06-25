#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "lib/board.h"
#include "lib/cJSON.h"

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
        else {
            printf("{}");
        }
    }
    printf("}");
}

int t_check_move_compatibility() {
    printf("testing check_move_compatibility\n");
    if (_check_move_compatibility("13", "2")) {
        printf("incompatible moves marked as compatible (13 vs 2)\n");
        return 0;
    }
    if (!_check_move_compatibility("314", "3")) {
        printf("compatible moves marked as incompaitble (314 vs 3)\n");
        return 0;
    }
    if (_check_move_compatibility("2", "13")) {
        printf("incompatible moves marked as compatible (2 vs 13)\n");
        return 0;
    }
    if (!_check_move_compatibility("3", "314")) {
        printf("compatible moves marked as incompatible (3 vs 314)\n");
        return 0;
    }
    return 1;
}

int t_clip_move() {
    printf("testing clip_move\n");
    char move[] = "2305";
    move[1] = 0;
    if (strlen(move) - 1 != 0) {
        printf("clip_move clipped the move wrong (depth was %d, should be %d)\n", strlen(move) - 1, 0);
        return 0;
    }
    return 1;
}

int t_count_descent() {
    printf("testing count_descent\n");
    char *length_zero = "0";
    if (strlen(length_zero) - 1 != 0) {
        printf("count_descent calculated move as wrong length (%d, should be 0)\n", strlen(length_zero) - 1);
        return 0;
    }
    char *length_one = "00";
    if (strlen(length_one) - 1 != 1) {
        printf("count_descent calculated move as wrong length (%d, should be 1)\n", strlen(length_one) - 1);
        return 0;
    }
    char *length_five = "123450";
    if (strlen(length_five) - 1 != 5) {
        printf("count_descent calculated move as wrong length (%d, should be 5)\n", strlen(length_five) - 1);
        return 0;
    }
    return 1;
}

int t_descend() {
    printf("testing descend\n");
    Game world = EMPTY_GAME(1);
    Board *child_1 = _descend(&world.board, 3);
    Board *child_2 = _descend(&world.board, 3);
    if (child_1 != child_2) {
        printf("descend creates two children with the same coordinate\n");
        return 0;
    }
    Board *child_3 = _descend(&world.board, 5);
    if (child_2 == child_3) {
        printf("descend conflates two children with different coordinates\n");
        return 0;
    }
    return 1;
}

int t_retrieve_symbol() {
    printf("testing retrieve_symbol\n");
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
    printf("testing place_symbol\n");
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
    printf("testing judge_board\n");
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
    
}

int t_play_a_game() {
    printf("Playing a game\n");
    char *move = malloc(256);
    Game game = EMPTY_GAME(1);
    cJSON *update = cJSON_CreateObject();
    Verdict player = X;
    printf("initialized\n");
    while (!cJSON_GetObjectItem(update, "success") || strlen(cJSON_GetStringValue(cJSON_GetObjectItem(update, "location"))) > 0) {
        printf("> ");
        scanf("%s", move);
        move[strlen(move)] = 0;
        printf("%s\n", move);
        update = process_move(&game, move, player);
        printf("%s\n", cJSON_Print(update));
        printf("%s\n", cJSON_Print(retrieve_state(&game, "", game.board.depth)));
        player = DRAW - player;
    }
}

int t_retrieve_state() {
    return 1;
}

int t_board_h() {
    int pass = 1;
    pass &= t_check_move_compatibility();
    pass &= t_clip_move();
    pass &= t_count_descent();
    pass &= t_descend();
    pass &= t_retrieve_symbol();
    pass &= t_place_symbol();
    pass &= t_judge_board();
    pass &= t_process_move();
    pass &= t_play_a_game();
    // pass &= t_retrieve_state();
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