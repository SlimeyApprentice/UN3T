import { createSlice, type Slice } from '@reduxjs/toolkit'
import type { ControlState, RenderBoard, TransitionStates } from './types.ts';

//Check if state is mid transition
// function is_trans(nearbyBoards) {
//   const num_active = Object.values(nearbyBoards).filter((active) => {
//     if (active == true) { return active }
//   }).length;

//   if (num_active != 1) {
//     return true;
//   } else {
//     return false;
//   }
// }

function refresh_board(state: ControlState) {
  state.renderBoards = [
    {
      depth: state.current_depth,
      coordinates: state.focus_coordinates,
      id: "middle-board",
      className: "top-board"
    }
  ]
}

export const MAX_DEPTH = 1;
// const default_depth = MAX_DEPTH-1;
const default_depth = MAX_DEPTH-1;

const init_idx = 4;
const default_coordinates = [init_idx];
const default_direction = "column";
const default_width = "100%"
const default_transition_states: TransitionStates = {
  "top": null,
  "left": null,
  "right": null,
  "bottom": null,
}

export const controlSlice: Slice<ControlState> = createSlice({
  name: 'Control State',
  initialState: {
    current_depth: default_depth,
    focus_coordinates: default_coordinates,
    renderBoards: [
      {
        depth: default_depth,
        coordinates: default_coordinates,
        id: "middle-board",
        className: "top-board"
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
    moveUp: (state: ControlState) => {
      const new_coords = state.focus_coordinates.slice();
      new_coords[new_coords.length-1] -= 3 

      const newBoards: RenderBoard[] = [];
      newBoards.push({
        depth: state.current_depth,
        coordinates: new_coords,
        id: "top-board",
        className: "top-board"
      })
      newBoards.push({
        depth: state.current_depth,
        coordinates: state.focus_coordinates,
        id: "middle-board",
        className: "top-board"
      })
      state.renderBoards = newBoards;

      //Capture width of window now and do not let it expand.
      //Might need .getBoundingClientRect()
      const locked_width = (document.querySelector(".react-transform-wrapper") as HTMLDivElement).offsetWidth; 
      state.window_width = locked_width.toString();

      state.direction = "column";
      state.transitionStates["top"] = new_coords;
    },
    moveLeft: (state) => {
      const new_coords = state.focus_coordinates.slice();
      new_coords[new_coords.length-1] -= 1; 

      const newBoards = [];
      newBoards.push({
        depth: state.current_depth,
        coordinates: new_coords,
        id: "left-board",
        key: "left-board",
        className: "top-board"
      })
      newBoards.push({
        depth: state.current_depth,
        coordinates: state.focus_coordinates,
        id: "middle-board",
        key: "middle-board",
        className: "top-board"
      })
      state.renderBoards = newBoards;

      //Capture width of window now and do not let it expand.
      //Might need .getBoundingClientRect()
      const locked_width = (document.querySelector(".react-transform-wrapper") as HTMLDivElement).offsetWidth; 
      state.window_width = locked_width.toString();

      state.direction = "row";
      state.transitionStates["left"] = new_coords;
    },
    moveDown: (state) => {
      const new_coords = state.focus_coordinates.slice();
      new_coords[new_coords.length-1] += 3; 

      const newBoards = [];
      newBoards.push({
        depth: state.current_depth,
        coordinates: state.focus_coordinates,
        id: "middle-board",
        key: "middle-board",
        className: "top-board"
      })
      newBoards.push({
        depth: state.current_depth,
        coordinates: new_coords,
        id: "bottom-board",
        key: "bottom-board",
        className: "top-board"
      })
      state.renderBoards = newBoards;

      //Capture width of window now and do not let it expand.
      //Might need .getBoundingClientRect()
      const locked_width = (document.querySelector(".react-transform-wrapper") as HTMLDivElement).offsetWidth; 
      state.window_width = locked_width.toString();

      state.direction = "column";
      state.transitionStates["bottom"] = new_coords;
    },
    moveRight: (state) => {
      const new_coords = state.focus_coordinates.slice();
      new_coords[new_coords.length-1] += 1; 

      const newBoards = [];
      newBoards.push({
        depth: state.current_depth,
        coordinates: state.focus_coordinates,
        id: "middle-board",
        key: "middle-board",
        className: "top-board"
      })
      newBoards.push({
        depth: state.current_depth,
        coordinates: new_coords,
        id: "right-board",
        key: "right-board",
        className: "top-board"
      })
      state.renderBoards = newBoards;

      //Capture width of window now and do not let it expand.
      //Might need .getBoundingClientRect()
      const locked_width = (document.querySelector(".react-transform-wrapper") as HTMLDivElement).offsetWidth; 
      state.window_width = locked_width.toString();

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