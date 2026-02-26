import { MessageValue, type MessageScan } from "../serverInterface"

//Game Types
export enum GameWinState {
    Cross = "X",
    Circle = "O",
    Draw = "D",
    Undecided = 0
}  

type BoardData = [
        BoardData | Player,
        BoardData | Player,
        BoardData | Player,
        BoardData | Player,
        BoardData | Player,
        BoardData | Player,
        BoardData | Player,
        BoardData | Player,
        BoardData | Player,
]
export class BoardClass {
    cells: BoardData;

    recursiveGet(state: BoardData, coordinates: number[]) {
        const next_coordinate = coordinates.pop()
        if (next_coordinate === undefined) return false;

        // Base Case
        if (typeof state[next_coordinate] !== "object") {
            if (coordinates.length > 0) console.error("Too many coordinates passed");

            return state[next_coordinate];
        }

        if (coordinates.length == 0) {
            console.error("SOMEHOW ENDED AT UNFINISHED BOARD")
            return false;
        } else {
            // Recursive step
            return this.recursiveGet(state[next_coordinate], coordinates);
        }
    }

    // Possible options of where the coordinates lead
    // Won cell
    // Cell in won board
    // 
    get cell(coordinates: number[]) {
        return this.recursiveGet(this.cells, coordinates);
    }

    constructor() {
        this.cells = [
            Player.Empty, Player.Empty, Player.Empty,
            Player.Empty, Player.Empty, Player.Empty,
            Player.Empty, Player.Empty, Player.Empty,
        ];
    }
    constructor(scan: MessageScan, depth: number) {
        this.cells = initFromScan(scan, depth);
    }

    initFromScan(scan: MessageScan, depth: number) {
        const state = new BoardClass();
        for (let i = 0; i < 9; i++) {
            if (typeof scan[i] === "number") {
                if (scan[i] === MessageValue.Empty) {
                    state.cells[i] = new BoardClass();
                } else {
                    //@ts-expect-error above condition guarantees it's a number
                    state.cells[i] = messageToGamePlayer(scan[i])
                }
            } else {
                //@ts-expect-error above condition guarantees it's an obj
                state.cells[i] = initFromScan(scan[i], depth-1)
            }
        }
    
        return state
    }
}

]
export enum Player {
    Cross = "X",
    Circle = "O",
    Empty = "#"
}
export type GameState = {
    maxDepth: string,
    myPlayer: Player,
    currentPlayer: Player,
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
// TODO: WE ARE FORGETTING DRAWS
export function playerToWinState(player: Player): GameWinState {
    switch(player) {
        case Player.Cross: return GameWinState.Cross;
        case Player.Circle: return GameWinState.Circle;
        default: throw new Error("Could not find GameWinState");
    }
}
export function cellToWinState(cell: BoardData | Player) {
    if (typeof cell === "object" || cell === Player.Empty) return GameWinState.Undecided;

    return playerToWinState(<Player> cell);
}

export function flipPlayer(player: Player): Player {
    switch(player) {
        case Player.Cross: return Player.Circle;
        case Player.Circle: return Player.Cross;
        case Player.Empty: return Player.Empty;
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

// query parameters for storing some state
export type QueryParameters ={
    id: string,
    player: Player
}