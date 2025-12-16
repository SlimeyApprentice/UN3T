import { MessageValue } from "../serverInterface"

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
    Empty = "#"
}
export type GameState = {
    maxDepth: string,
    myPlayer: Player,
    restriction: number[],
    boardSize: number,
    borderSize: number,
    globalBoard: BoardData,
    id: string,
}
//Should really unify all of these player types
export function messageToGamePlayer(player: MessageValue): Player {
    switch(player) {
        case MessageValue.Empty: return Player.Empty;
        case MessageValue.Cross: return Player.Cross;
        case MessageValue.Circle: return Player.Circle; 
        default: throw new Error("Tried to convert error message value");
    }
}
export function playerToWinState(player: Player): GameWinState {
    switch(player) {
        case Player.Cross: return GameWinState.Cross;
        case Player.Circle: return GameWinState.Circle;
        default: throw new Error("Could not find GameWinState");
    }
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