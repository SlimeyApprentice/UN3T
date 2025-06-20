import { createSlice } from '@reduxjs/toolkit'
import { max_depth } from './controlSlice';

function initBoard(depth) {
    let state = {
      "cells": [],
      "game_state": null
    };
    for (let i = 0; i < 9; i++) {
      if (depth > 0) {
        state.cells[i] = initBoard(depth-1)
      } else {
        state.cells[i] = null;
      }
    }
  
    return state
  }

export const gameSlice = createSlice({
  name: 'Game State',
  initialState: {
    xIsNext: true,
    boardSize: 75,
    borderSize: 2,
    globalBoard: initBoard(max_depth)
  },
  reducers: {
    switchTurn: (state) => {
        state.xIsNext = !state.xIsNext;
    },
  },
})

// Action creators are generated for each case reducer function
export const { switchTurn } = gameSlice.actions

export default gameSlice.reducer