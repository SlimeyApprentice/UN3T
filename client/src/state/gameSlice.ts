import { createSlice, current } from '@reduxjs/toolkit'

import { 
  flipPlayer,
  GameWinState, 
  messageToGamePlayer, 
  Player, 
  playerToWinState, 
  type BoardData, 
  type GameState 
} from './types.ts';
import { MessageValue, type MessageScan, type MessageTurn } from '../serverInterface.ts';

function initBoard() {
    const state: BoardData = [
      Player.Empty, Player.Empty, Player.Empty,
      Player.Empty, Player.Empty, Player.Empty,
      Player.Empty, Player.Empty, Player.Empty,
    ];
  
    return state
}
function initFromScan(scan: MessageScan, depth: number) {
    const state: BoardData = initBoard();
    for (let i = 0; i < 9; i++) {
      if (typeof scan[i] === "number") {
        if (scan[i] === MessageValue.Empty) {
          state[i] = initBoard();
        } else {
          //@ts-expect-error above condition guarantees it's a number
          state[i] = messageToGamePlayer(scan[i])
        }
      } else {
        //@ts-expect-error above condition guarantees it's an obj
        state[i] = initFromScan(scan[i], depth-1)
      }
    }
  
    return state
}

function recursiveEdit(state: BoardData, coordinates: number[], player: Player): boolean{
    const next_coordinate = coordinates.pop()
    if (next_coordinate === undefined) return false;

    if (coordinates.length === 0) {
        console.log("FINAL COORDINATE: " + next_coordinate);
        state[next_coordinate] = player;
    } else {
        console.log("COORDINATE: " + next_coordinate);
        if (typeof state[next_coordinate] === "number") state[next_coordinate] = initBoard();
        recursiveEdit(<BoardData> state[next_coordinate], coordinates, player)
    }
    return true;
}

const initialState: GameState = {
    maxDepth: "1",
    myPlayer: Player.Empty,
    currentPlayer: Player.Cross,
    restriction: [],
    boardSize: 75,
    borderSize: 2,
    globalBoard: initBoard(),
    id: "",
}
export const gameSlice = createSlice({
  name: 'Game State',
  initialState,
  reducers: {
    resetGame: (state) => {
      state = initialState;
    },
    setGameDepth: (state, action) => {
      state.maxDepth = action.payload;
      console.log("setGameDepth: " + action.payload);
    },
    initGlobalBoard: (state) => {
      if (!state.maxDepth) throw new Error("maxDepth empty in initGlobalBoard");

      console.log("initGlobalBoard");
      state.globalBoard = initBoard();
    },
    setGameID: (state, action) => {
      console.log("Seeting game id: " + action.payload);
      state.id = action.payload;
    },
    setPlayer: (state, action) => {
      state.myPlayer = action.payload;
    },
    receiveMove: (state, action) => {
      const move: MessageMove = action.payload;
      if (!move.success || move.location === undefined) return;

      const restriction = move.restriction!.split('').map((char) => parseInt(char));
      state.restriction = restriction;

      const coordinates = move.location.split('').map((char) => parseInt(char));
      console.log("Received coordinates: " + coordinates);
      console.log("Received restriction: " + restriction);
      console.log("Length: " + coordinates.length);
      const player = messageToGamePlayer(move.value)

      if (coordinates.length === 0) {
        // state.globalBoard.game_state = playerToWinState(player); 
      } else if (coordinates.length-1 < parseInt(state.maxDepth)) {
        recursiveEdit(state.globalBoard, coordinates.reverse(), player);
      } else {
        recursiveEdit(state.globalBoard, coordinates.reverse(), player);
      }

      //Flip player turn (not confirmed in message)
      state.currentPlayer = flipPlayer(state.currentPlayer);

      console.log(current(state.globalBoard));
    },
    receiveTurn: (state, action) => {
      const turn: MessageTurn = action.payload;

      state.maxDepth = turn.depth.toString();
      state.globalBoard = initBoard();
      state.myPlayer = messageToGamePlayer(turn.you);
      state.currentPlayer = messageToGamePlayer(turn.player);

      state.restriction = turn.restriction.split('').map((char) => parseInt(char));
    },
    receiveScan: (state, action) => {
      const scan: MessageScan = action.payload;
      console.log(scan);

      state.globalBoard = initFromScan(scan, parseInt(state.maxDepth));
    }
  },
})

// Action creators are generated for each case reducer function
export const { resetGame, setGameDepth, initGlobalBoard, setPlayer, setGameID, receiveMove, receiveTurn, receiveScan } = gameSlice.actions

export default gameSlice.reducer