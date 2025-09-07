import { createSlice } from '@reduxjs/toolkit'

import { GameWinState, messageToGamePlayer, Player, type BoardData, type GameMove, type GameState } from './types.ts';

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

function recursiveEdit(state: BoardData, coordinates: number[], player: Player): boolean{
    const next_coordinate = coordinates.pop()
    if (!next_coordinate) return false;

    if (coordinates.length == 0) {
        console.log("FINAL COORDINATE: " + next_coordinate);
        state.cells[next_coordinate] = player;
    } else {
        console.log("COORDINATE: " + next_coordinate);
        recursiveEdit(<BoardData> state.cells[next_coordinate], coordinates, player)
    }
    return true;
}

const initialState: GameState = {
    maxDepth: "1",
    xIsNext: true,
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
    makeMove: (state) => {
      let player: Player;
      if (state.xIsNext) {
        player = Player.Cross;
      } else {
        player = Player.Circle;
      }
      state.xIsNext = !state.xIsNext;

      // We expect that whoever called us will later send the move to server
    },
    receiveMove: (state, action) => {
      const move: GameMove = action.payload;
      console.log(!move.success);
      console.log(!move.location);
      if (!move.success || !move.location) return;

      const coordinates = move.location.split('').map((char) => parseInt(char));
      const player = messageToGamePlayer(move.value)

      recursiveEdit(state.globalBoard, coordinates, player);
    }
  },
})

// Action creators are generated for each case reducer function
export const { setGameDepth, initGlobalBoard, setGameID, makeMove, receiveMove } = gameSlice.actions

export default gameSlice.reducer