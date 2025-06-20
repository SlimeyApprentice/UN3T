import { createSlice } from '@reduxjs/toolkit'

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

const depth = 2;

export const gameSlice = createSlice({
  name: 'Game State',
  initialState: {
    xIsNext: true,
    current_depth: depth-1,
    current_index: 4,
    nearbyBoards: {
        "top": false,
        "left": false,
        "middle": true,
        "right": false,
        "bottom": false,
    },
    boardSize: 75,
    borderSize: 2,
    globalBoard: initBoard(depth)
  },
  reducers: {
    switchTurn: (state) => {
        state.xIsNext = !state.xIsNext;
    },
    zoomUp: (state) => {
        state.current_depth++;
    },
    zoomDown: (state) => {
        state.current_depth--;
    },
  },
})

// Action creators are generated for each case reducer function
export const { switchTurn, zoomUp, zoomDown } = gameSlice.actions

export default gameSlice.reducer