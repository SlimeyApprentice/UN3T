import { createSlice, type Slice } from '@reduxjs/toolkit'

import { MAX_DEPTH } from './controlSlice.ts';
import { GameWinState } from '../components/game/Board.tsx';

export type Board = {
  cells: Board[] | Player[]
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
  globalBoard: Board
}

function initBoard(depth: number) {
    let state: Board = {
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

function recursiveEdit(state: Board, coordinates: number[], player: Player): boolean{
    const next_coordinate = coordinates.pop()
    if (!next_coordinate) return false;

    if (coordinates.length == 0) {
        // console.log("FINAL COORDINATE: " + next_coordinate);
        state.cells[next_coordinate] = player;
    } else {
        // console.log("COORDINATE: " + next_coordinate);
        recursiveEdit(<Board> state.cells[next_coordinate], coordinates, player)
    }
    return true;
}

const initialState: GameState = {
    xIsNext: true,
    boardSize: 75,
    borderSize: 2,
    globalBoard: initBoard(MAX_DEPTH)
}
export const gameSlice = createSlice({
  name: 'Game State',
  initialState,
  reducers: {
    makeMove: (state, action) => {
        const coordinates = action.payload.slice();
        let player: Player;
        if (state.xIsNext) {
          player = Player.Cross;
        } else {
          player = Player.Circle;
        }
        state.xIsNext = !state.xIsNext;

        //Here would go the API call soon
        recursiveEdit(state.globalBoard, coordinates.reverse(), player);

        // axios.get('https://api.example.com/users')
        // .then(response => {
        //   // Handle the response data
        //   console.log(response);
        // })
        // .catch(error => {
        //   // Handle errors
        // });
    }
  },
})

// Action creators are generated for each case reducer function
export const { makeMove } = gameSlice.actions

export default gameSlice.reducer