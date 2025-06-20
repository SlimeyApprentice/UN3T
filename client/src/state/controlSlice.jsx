import { createSlice } from '@reduxjs/toolkit'

export const max_depth = 2;

export const controlSlice = createSlice({
  name: 'Control State',
  initialState: {
    current_depth: max_depth-1,
    current_index: 4,
    nearbyBoards: {
        "top": false,
        "left": false,
        "middle": true,
        "right": false,
        "bottom": false,
    },
  },
  reducers: {
    zoomUp: (state) => {
        state.current_depth++;
    },
    zoomDown: (state) => {
        state.current_depth--;
    },
  },
})

// Action creators are generated for each case reducer function
export const { zoomUp, zoomDown } = controlSlice.actions

export default controlSlice.reducer