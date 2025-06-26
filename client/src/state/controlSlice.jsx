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
    transitionStates: {
        "top": null,
        "left": null,
        "right": null,
        "bottom": null,
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
    movedUp: (state) => {
      state.transitionStates.top = "spawned";
    }
  },
})

// Action creators are generated for each case reducer function
export const { zoomUp, zoomDown, movedUp } = controlSlice.actions

export default controlSlice.reducer