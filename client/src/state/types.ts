import { MessageValue, type MessageScan } from "../serverInterface"

//TODO: GameWinState ought to merge with Player

//Game Types
export enum GameWinState {
    Cross = "X",
    Circle = "O",
    Draw = "D",
    Undecided = 0
}  
export enum Player {
    Cross = "X",
    Circle = "O",
    Empty = "#",
    Draw = "D",
}

export type PlayerCount = {
  cross: number,
  circle: number, 
  empty: number
}
function add_counts(res1: PlayerCount, res2: PlayerCount) {
  const result: PlayerCount = {
    cross: 0,
    circle: 0,
    empty: 0
  }

  //Probably a cleaner prototype method out there
  result.cross = res1.cross + res2.cross;
  result.circle = res1.circle + res2.circle;
  result.empty = res1.empty + res2.empty;

  return result;
}

export type BoardCells = [
        BoardCells | Player,
        BoardCells | Player,
        BoardCells | Player,
        BoardCells | Player,
        BoardCells | Player,
        BoardCells | Player,
        BoardCells | Player,
        BoardCells | Player,
        BoardCells | Player,
] | Player
// Make a copy of an empty board
export function emptyBoardCells(): BoardCells {
    return [
        Player.Empty, Player.Empty, Player.Empty,
        Player.Empty, Player.Empty, Player.Empty,
        Player.Empty, Player.Empty, Player.Empty,
    ];
} 
export class BoardClass {
    private cells: BoardCells | Player;

    constructor();
    constructor(cells: BoardCells | Player);

    constructor(cells?: BoardCells | Player) {
        if (cells !== undefined) {
            //Signature 2
            this.cells = cells;
        } else {
            //Signature 1
            this.cells = emptyBoardCells();
        }
    }

    get length() {
        return this.cells.length;
    }

    get player() {
        if (typeof this.cells !== "object") return this.cells as Player;
        
        return Player.Empty;
    }

    // TODO: WE ARE FORGETTING DRAWS
    get game_state() {
        switch(this.player) {
            case Player.Cross: return GameWinState.Cross;
            case Player.Circle: return GameWinState.Circle;
            case Player.Empty: return GameWinState.Undecided;
            case Player.Draw: return GameWinState.Draw;
            // default: throw new Error("Could not find GameWinState");
        }
    }

    get leaf_board(): Player[] | boolean {
        for (let i = 0; i < this.cells.length; i++) {
            if (typeof this.cells[i] === "object") {
                console.error("Leaf Board accessed on node board");
                return false;
            }
        }

        return this.cells as Player[];
    }

    recursiveCount(board: BoardClass): PlayerCount {
        let result: PlayerCount = {
            cross: 0,
            circle: 0,
            empty: 0,
        }

        for (let i = 0; i < board.length; i++) {
            const zoom_in = board.getCell([i]);

            // If BoardCells
            if (typeof(zoom_in) === "object") {
                //Recursive step
                result = add_counts(result, this.recursiveCount(
                    new BoardClass(zoom_in as BoardCells)
                ));
            // If Player
            } else {
                switch (zoom_in) {
                    case Player.Cross:
                        result.cross++;
                        break;
                    case Player.Circle:
                        result.circle++;
                        break;
                    case Player.Empty:
                        result.empty++;
                        break;
                }
            }
        }

        return result;
    }
    get count() {
        return this.recursiveCount(this);
    }

    recursiveGet(state: BoardCells, coordinates: number[]): BoardCells | Player {
        // Base Case
        if (coordinates.length === 0) {
            return state;
        }

        const next_coordinate = coordinates.pop()
        // Check for next_coordinate undefined just for type guarantee
        if (next_coordinate === undefined) return state;    

        if (typeof state[next_coordinate] !== "object") {
            if (coordinates.length > 0) {
                // Coordinates point to a board that is unloaded
                // console.error("Too many coordinates passed");
            }
            
            return state[next_coordinate] as Player;
        } else {
            // Recursive step
            return this.recursiveGet(state[next_coordinate], coordinates);
        }
    }

    // Possible options of where the coordinates lead
    // Won cell
    // Cell in won board
    
    // TODO: Maybe should be error if you are calling getCell on single player board?
    getCell(coordinates: number[]): BoardCells | Player {
        if (typeof this.cells !== "object") return this.cells as Player;

        const local_coordinates = coordinates.slice().reverse();

        // TODO: Not confident this is necessary
        const local_cells = <BoardCells> this.cells.slice();

        return this.recursiveGet(local_cells, local_coordinates);
    }

    recursiveSetCell(state: BoardCells, coordinates: number[], player: Player) {
        const next_coordinate = coordinates.pop()
        // Check for next_coordinate undefined just for type guarantee
        if (next_coordinate === undefined) return;    

        if (coordinates.length === 0) {
            console.log("FINAL COORDINATE: " + next_coordinate);
            state[next_coordinate] = player;
        } else {
            console.log("COORDINATE: " + next_coordinate);
            if (state[next_coordinate] === Player.Empty) {
                console.log("DIGGING DEEPER");
                state[next_coordinate] = emptyBoardCells();
            }

            this.recursiveSetCell(<BoardCells> state[next_coordinate], coordinates, player);
        }
    }
    // TODO: Should check whether coordinates longer than depth 
    // TODO: Should check whether we are adding moves to won board
    setCell(coordinates: number[], player: Player) {
        if (typeof this.cells !== "object") {this.cells = player; return;}
        if (coordinates.length === 0) {this.cells = player; return;}

        const local_coordinates = coordinates.slice().reverse();

        const local_cells = <BoardCells> this.cells.slice();
        this.recursiveSetCell(local_cells, local_coordinates, player);
        this.cells = local_cells;
    }
    
}

export function initCellsFromScan(scan: MessageScan, depth: number) {
    const state = emptyBoardCells();
    for (let i = 0; i < 9; i++) {
        if (typeof scan[i] === "number") {
            //@ts-expect-error above condition guarantees it's a number
            state[i] = messageToGamePlayer(scan[i])
        } else {
            //@ts-expect-error above condition guarantees it's an obj
            state[i] = initCellsFromScan(scan[i], depth-1)
        }
    }

    return state;
}
export function initBoardFromScan(scan: MessageScan, maxDepth: number): BoardClass {
    return new BoardClass(initCellsFromScan(scan, maxDepth));
}

export type GameState = {
    maxDepth: string,
    myPlayer: Player,
    currentPlayer: Player,
    restriction: number[],
    boardSize: number,
    borderSize: number,
    globalBoardCells: BoardCells,
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