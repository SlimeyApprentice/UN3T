#include <stdio.h>
#include <board.h>

int main() {
    Board *board = NULL;
    Position *mantissa;
    scanf("%d", mantissa);
    move(board, mantissa, X);
    printf(board->cells[*mantissa]);
    return 0;
}