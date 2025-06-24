import { createSlice } from '@reduxjs/toolkit'
import React from 'react';

import Board from '../Board.jsx';

//Check if state is mid transition
function is_trans(nearbyBoards) {
  const num_active = Object.values(nearbyBoards).filter((active) => {
    if (active == true) { return active }
  }).length;

  if (num_active != 1) {
    return true;
  } else {
    return false;
  }
}

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
    direction: "column",
  },
  reducers: {
    zoomUp: (state) => {
        state.current_depth++;
        state.focus_coordinates.pop();
    },
    zoomDown: (state, action) => {
        const coordinate = action.payload;

        state.focus_coordinates = state.focus_coordinates.concat([coordinate]);
        state.current_depth--;
    },
    directionColumn: (state) => {
      state.direction = "column";
    },
    directionRow: (state) => {
      state.direction = "row";
    },
    movedUp: (state) => {
      
    }
  },
})

// Action creators are generated for each case reducer function
export const { zoomUp, zoomDown, directionColumn, directionRow } = controlSlice.actions

export default controlSlice.reducer