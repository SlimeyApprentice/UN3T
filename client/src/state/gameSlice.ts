import { createSlice, current } from '@reduxjs/toolkit'

import { 
  GameWinState, 
  messageToGamePlayer, 
  Player, 
  playerToWinState, 
  type BoardData, 
  type GameState 
} from './types.ts';
import { MessageValue, type MessageScan, type MessageTurn } from '../serverInterface.ts';

// TODO: Type all payloads
// TODO: Only create boards when there are moves on it
function initBoard(depth: number) {
    const state: BoardData = {
      "cells": [],
      "game_state": GameWinState.Undecided
    };
    for (let i = 0; i < 9; i++) {
      if (depth > 0) {
        state.cells[i] = initBoard(depth-1)
      } else {
        state.cells[i] = Player.Empty;
      }
    }
  
    return state
}
function initFromScan(scan: MessageScan, depth: number) {
    const state: BoardData = {
      "cells": [],
      "game_state": GameWinState.Undecided
    };
    for (let i = 0; i < 9; i++) {
      if (typeof scan[i] === "number") {
        if (scan[i] === MessageValue.Empty) {
          state.cells[i] = initBoard(depth-1);
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

function recursiveEdit(state: BoardData, coordinates: number[], player: Player, winFlag: boolean): boolean{
    const next_coordinate = coordinates.pop()
    if (next_coordinate === undefined) return false;

    if (coordinates.length === 0) {
        console.log("FINAL COORDINATE: " + next_coordinate);
        if (winFlag) {
          // @ts-expect-error we know for sure
          state.cells[next_coordinate].game_state = playerToWinState(player);
        } else {
          state.cells[next_coordinate] = player;
        }
    } else {
        console.log("COORDINATE: " + next_coordinate);
        recursiveEdit(<BoardData> state.cells[next_coordinate], coordinates, player, winFlag)
    }
    return true;
}

const initialState: GameState = {
    maxDepth: "1",
    myPlayer: Player.Empty,
    restriction: [],
    boardSize: 75,
    borderSize: 2,
    globalBoard: initBoard(parseInt("1")),
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

      console.log("initGlobalBoard maxDepth: " + state.maxDepth);
      state.globalBoard = initBoard(parseInt(state.maxDepth));
    },
    setGameID: (state, action) => {
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
        state.globalBoard.game_state = playerToWinState(player); 
      } else if (coordinates.length-1 < parseInt(state.maxDepth)) {
        recursiveEdit(state.globalBoard, coordinates.reverse(), player, true);
      } else {
        recursiveEdit(state.globalBoard, coordinates.reverse(), player, false);
      }

      console.log(current(state.globalBoard));
    },
    receiveTurn: (state, action) => {
      const turn: MessageTurn = action.payload;

      state.maxDepth = turn.depth.toString();
      state.globalBoard = initBoard(parseInt(state.maxDepth));
      state.myPlayer = messageToGamePlayer(turn.you);

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