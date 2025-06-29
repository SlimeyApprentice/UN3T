import { createSlice } from '@reduxjs/toolkit'

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

function refresh_board(state) {
  state.renderBoards = [
    {
      depth: state.current_depth,
      coordinates: state.focus_coordinates,
      id: "middle-board",
      key: "middle-board",
    }
  ]
}

export const MAX_DEPTH = 3;
const default_depth = MAX_DEPTH-1;

const init_idx = 4;
const default_coordinates = [init_idx];
const default_direction = "column";
const default_width = "100%"
const default_transition_states = {
  "top": null,
  "left": null,
  "right": null,
  "bottom": null,
}


export const controlSlice = createSlice({
  name: 'Control State',
  initialState: {
    current_depth: default_depth,
    focus_coordinates: default_coordinates,
    renderBoards: [
      {
        depth: default_depth,
        coordinates: default_coordinates,
        id: "middle-board",
        key: "middle-board",
      }
    ],
    transitionStates: default_transition_states,
    direction: default_direction,
    window_width: default_width,
  },
  reducers: {
    zoomUp: (state) => {
        state.current_depth++;
        state.focus_coordinates.pop();
        refresh_board(state);
    },
    zoomDown: (state, action) => {
        const coordinate = action.payload;

        state.focus_coordinates = state.focus_coordinates.concat([coordinate]);
        state.current_depth--;
        refresh_board(state);
    },
    moveUp: (state) => {
      let new_coords = state.focus_coordinates.slice();
      new_coords[new_coords.length-1] -= 3 

      let newBoards = [];
      newBoards.push({
        depth: state.current_depth,
        coordinates: new_coords,
        id: "top-board",
        key: "top-board",
      })
      newBoards.push({
        depth: state.current_depth,
        coordinates: state.focus_coordinates,
        id: "middle-board",
        key: "middle-board",
      })
      state.renderBoards = newBoards;

      //Capture width of window now and do not let it expand.
      const locked_width = document.querySelector(".react-transform-wrapper").offsetWidth; //Might need .getBoundingClientRect()
      state.window_width = locked_width;

      state.direction = "column";
      state.transitionStates["top"] = new_coords;
    },
    moveLeft: (state) => {
      let new_coords = state.focus_coordinates.slice();
      new_coords[new_coords.length-1] -= 1; 

      let newBoards = [];
      newBoards.push({
        depth: state.current_depth,
        coordinates: new_coords,
        id: "left-board",
        key: "left-board",
      })
      newBoards.push({
        depth: state.current_depth,
        coordinates: state.focus_coordinates,
        id: "middle-board",
        key: "middle-board",
      })
      state.renderBoards = newBoards;

      //Capture width of window now and do not let it expand.
      const locked_width = document.querySelector(".react-transform-wrapper").offsetWidth; //Might need .getBoundingClientRect()
      state.window_width = locked_width;

      state.direction = "row";
      state.transitionStates["left"] = new_coords;
    },
    moveDown: (state) => {
      let new_coords = state.focus_coordinates.slice();
      new_coords[new_coords.length-1] += 3; 

      let newBoards = [];
      newBoards.push({
        depth: state.current_depth,
        coordinates: state.focus_coordinates,
        id: "middle-board",
        key: "middle-board",
      })
      newBoards.push({
        depth: state.current_depth,
        coordinates: new_coords,
        id: "bottom-board",
        key: "bottom-board",
      })
      state.renderBoards = newBoards;

      //Capture width of window now and do not let it expand.
      const locked_width = document.querySelector(".react-transform-wrapper").offsetWidth; //Might need .getBoundingClientRect()
      state.window_width = locked_width;

      state.direction = "column";
      state.transitionStates["bottom"] = new_coords;
    },
    moveRight: (state) => {
      let new_coords = state.focus_coordinates.slice();
      new_coords[new_coords.length-1] += 1; 

      let newBoards = [];
      newBoards.push({
        depth: state.current_depth,
        coordinates: state.focus_coordinates,
        id: "middle-board",
        key: "middle-board",
      })
      newBoards.push({
        depth: state.current_depth,
        coordinates: new_coords,
        id: "right-board",
        key: "right-board",
      })
      state.renderBoards = newBoards;

      //Capture width of window now and do not let it expand.
      const locked_width = document.querySelector(".react-transform-wrapper").offsetWidth; //Might need .getBoundingClientRect()
      state.window_width = locked_width;

      state.direction = "row";
      state.transitionStates["right"] = new_coords;
    },
    transitionComplete: (state) => {
      console.log("Transition Complete");

      Object.values(state.transitionStates).forEach((value) => {
        if (value !== null) {
          state.focus_coordinates = value;
        }
      })

      refresh_board(state); //New board is the middle and only board

      state.transitionStates = default_transition_states;

      state.window_width = default_width;
      state.direction = default_direction;
    }
  },
})

// Action creators are generated for each case reducer function
export const { zoomUp, zoomDown, moveUp, moveLeft, moveDown, moveRight, transitionComplete } = controlSlice.actions

export default controlSlice.reducer