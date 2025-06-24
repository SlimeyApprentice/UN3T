import { createSlice } from '@reduxjs/toolkit'
import React from 'react';

import Board from '../Board.jsx';

export const MAX_DEPTH = 2;

export const controlSlice = createSlice({
  name: 'Control State',
  initialState: {
    current_depth: MAX_DEPTH-1,
    focus_coordinates: [4],
    nearbyBoards: {
        "top": false,
        "left": false,
        "middle": true,
        "right": false,
        "bottom": false,
    },
    allBoards: [
      <Board depth={MAX_DEPTH-1} coordinates={[4]} key={"middle"}/>
    ]
  },
  reducers: {
    zoomUp: (state) => {
        state.current_depth++;
        state.focus_coordinates.pop();
        state.allBoards = [<Board depth={state.current_depth} coordinates={state.focus_coordinates} key={"middle"}/>];
    },
    zoomDown: (state, action) => {
        const coordinate = action.payload;

        state.focus_coordinates = state.focus_coordinates.concat([coordinate]);
        state.current_depth--;

        state.allBoards = [<Board depth={state.current_depth} coordinates={state.focus_coordinates} key={"middle"}/>];
    },
    moveUp: (state) => {
      state.allBoards.push(<Board depth={state.current_depth} coordinates={[1]} key={"top"}/>)
    },
  },
})

// Action creators are generated for each case reducer function
export const { zoomUp, zoomDown, moveUp } = controlSlice.actions

export default controlSlice.reducer