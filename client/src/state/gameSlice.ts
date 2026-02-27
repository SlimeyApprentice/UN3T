import { createSlice, current } from '@reduxjs/toolkit'

import { 
  BoardClass,
  emptyBoardCells,
  flipPlayer,
  GameWinState, 
  initBoardFromScan, 
  initCellsFromScan, 
  messageToGamePlayer, 
  Player, 
  playerToWinState, 
  type BoardCells, 
  type GameState 
} from './types.ts';
import { MessageValue, type MessageScan, type MessageTurn } from '../serverInterface.ts';

const initialState: GameState = {
    maxDepth: "1",
    myPlayer: Player.Empty,
    currentPlayer: Player.Cross,
    restriction: [],
    boardSize: 75,
    borderSize: 2,
    globalBoardCells: emptyBoardCells(),
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
      state.globalBoardCells = emptyBoardCells();
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

      const restriction = move.restriction!
        .split('')
        .map((char) => parseInt(char));
      state.restriction = restriction;

      const coordinates: number[] = move.location
        .split('')
        .map((char) => parseInt(char));
      console.log("Received coordinates: " + coordinates);
      console.log("Received restriction: " + restriction);
      console.log("Length: " + coordinates.length);
      const player = messageToGamePlayer(move.value)

      const globalBoard = new BoardClass(state.globalBoardCells);
      globalBoard.setCell(coordinates.reverse(), player);
      // console.log(globalBoard.getCell([]))
      state.globalBoardCells = globalBoard.getCell([]);

      //Flip player turn (not confirmed in message)
      state.currentPlayer = flipPlayer(state.currentPlayer);
    },
    receiveTurn: (state, action) => {
      const turn: MessageTurn = action.payload;

      state.maxDepth = turn.depth.toString();
      state.globalBoardCells = emptyBoardCells();
      state.myPlayer = messageToGamePlayer(turn.you);
      state.currentPlayer = messageToGamePlayer(turn.player);

      state.restriction = turn.restriction
        .split('')
        .map((char) => parseInt(char));
    },
    receiveScan: (state, action) => {
      const scan: MessageScan = action.payload;
      console.log(scan);

      state.globalBoardCells = initCellsFromScan(scan, parseInt(state.maxDepth));
    }
  },
})

// Action creators are generated for each case reducer function
export const { resetGame, setGameDepth, initGlobalBoard, setPlayer, setGameID, receiveMove, receiveTurn, receiveScan } = gameSlice.actions

export default gameSlice.reducer