import { createSlice, current } from '@reduxjs/toolkit'

import { GameWinState, messageToGamePlayer, Player, playerToWinState, type BoardData, type GameMove, type GameState } from './types.ts';

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

function recursiveEdit(state: BoardData, coordinates: number[], player: Player, winFlag: boolean): boolean{
    const next_coordinate = coordinates.pop()
    if (next_coordinate === undefined) return false;

    console.log(coordinates.length);
    console.log(coordinates.length === 0)
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
    setGameDepth: (state, action) => {
      state.maxDepth = action.payload;
    },
    initGlobalBoard: (state) => {
      if (!state.maxDepth) throw new Error("maxDepth empty in initGlobalBoard");

      state.globalBoard = initBoard(parseInt(state.maxDepth));
    },
    // TODO: Type the payload
    setGameID: (state, action) => {
      state.id = action.payload;
    },
    setPlayer: (state, action) => {
      state.myPlayer = action.payload;
    },
    receiveMove: (state, action) => {
      const move: GameMove = action.payload;
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
    }
  },
})

// Action creators are generated for each case reducer function
export const { setGameDepth, initGlobalBoard, setPlayer, setGameID, receiveMove } = gameSlice.actions

export default gameSlice.reducer