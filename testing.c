#include <stdio.h>
#include "lib/board.h"

int main() {
    Board board = {NULL, 0, BLANK, EMPTY};
    Move *mantissa;
    scanf("%d", mantissa->coordinate);
    Verdict player = X;
    while (1) {
        move(&board, mantissa, player);
        for (int i=0; i<9; i++) {
            printf("%d", board->cells[i]);
        }
        player = DRAW - player;
    }
    return 0;
}