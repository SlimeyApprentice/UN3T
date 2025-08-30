//Game Types
export enum GameWinState {
    Cross = "X",
    Circle = "O",
    Draw = "D",
    Undecided = 0
}  
export type BoardData = {
    cells: BoardData[] | Player[]
    game_state: GameWinState
}
export enum Player {
    Cross = "X",
    Circle = "O",
    Empty = ""
}
export type GameState = {
    xIsNext: boolean,
    boardSize: number,
    borderSize: number,
    globalBoard: BoardData
}

// Control Types
export type RenderBoard = {
    depth: number,
    coordinates: number[],
    id: string,
    className: string
}
export type TransitionStates = {
    top: number[] | null,
    left: number[] | null,
    right: number[] | null,
    bottom: number[] | null,
}
export type ControlState = {
    current_depth: number,
    focus_coordinates: number[],
    renderBoards: RenderBoard[],
    transitionStates: TransitionStates,
    direction: string,
    window_width: string,
}