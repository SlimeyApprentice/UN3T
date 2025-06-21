import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios';

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

function recursiveEdit(state, coordinates, player) {
    const next_coordinate = coordinates.pop()
    if (coordinates.length == 0) {
        console.log("FINAL COORDINATE: " + next_coordinate);
        state.cells[next_coordinate] = player;
    } else {
        console.log("COORDINATE: " + next_coordinate);
        recursiveEdit(state.cells[next_coordinate], coordinates, player)
    }
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
    makeMove: (state, action) => {
        const coordinates = action.payload.slice();
        let player;
        if (state.xIsNext) {
          player = "X"
        } else {
          player = "O";
        }
        state.xIsNext = !state.xIsNext;

        console.log("Making move according to coordinates: ");
        console.log(coordinates);

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
export const { switchTurn, makeMove } = gameSlice.actions

export default gameSlice.reducer