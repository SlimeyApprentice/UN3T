import React from 'react';
import { useState, useEffect} from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSelector, useDispatch } from 'react-redux';
import { useControls } from 'react-zoom-pan-pinch';

import Board from './game/Board.jsx';
import { MAX_DEPTH, zoomUp, zoomDown, movedUp } from './state/controlSlice.jsx'

function App({windowRef}) {
  const dispatch = useDispatch()

  const current_depth = useSelector((state) => state.control.current_depth);
  const focus_coordinates = useSelector((state) => state.control.focus_coordinates);

  //CSS variables and the CSS for the element we change dynamically
  const boardSize = useSelector((state) => state.game.boardSize);
  const borderSize = useSelector((state) => state.game.borderSize);
  const [direction, setDirection] = useState("column");
  //Board width with padding * number of board + borders + top level borders + top level padding
  // const calculated_width = ((boardSize + 20)*Math.pow(3, current_depth)) + ((borderSize*2)*(Math.pow(3, current_depth-1))) + (boardSize*2) + 20
  const [window_width, setWidth] = useState("fit-content");
  var cssVars = {
    "--board-size": boardSize + "px",
    "--border-size": borderSize + "px",
    "width": window_width,
    "display": "flex",
    "flex-direction": direction,
  };

  const [renderedBoards, setBoards] = useState([
    <Board depth={current_depth} coordinates={focus_coordinates} className={"middle-board"} id={"middle"} key={"middle"}/>
  ]);

  //All the hotkeys
  useHotkeys('w', () => {
    if (current_depth == MAX_DEPTH || focus_coordinates[focus_coordinates.length-1] < 3 || renderedBoards.length > 1) { return }
    console.log("TRIGGER");

    // //You'd do a transition from one to the other here
    // dispatch(moveUp());

    let new_coords = focus_coordinates.slice();
    new_coords[new_coords.length-1] -= 3 

    let newBoards = [];
    newBoards.push(<Board depth={current_depth} coordinates={new_coords} className="top-board" id={"top"} key={"top"}/>);
    newBoards.push(<Board depth={current_depth} coordinates={focus_coordinates} className="middle-board" id={"middle"} key={"middle"}/>);
    setBoards(newBoards);

    //Capture width of window now and do not let it expand.
    const locked_width = document.querySelector(".react-transform-wrapper").offsetWidth; //Might need .getBoundingClientRect()
    setWidth(locked_width);

    //Still not sure how much should be handled here or in redux
    setDirection("column");
    dispatch(movedUp()) //Important to tell to move after re-render
  });

  useHotkeys('q', () => {
    if (current_depth == MAX_DEPTH) { return }

    setTransform(-400, 0, 1);

    dispatch(zoomUp());
  });
  useHotkeys('e', () => {
    if (current_depth == 0) { return }

    const hoverElement = document.querySelector(".active-board:hover");

    if (hoverElement === null) { return }

    const coordinate = hoverElement.className[hoverElement.className.length - 1];

    const validInts = ['0', '1', '2', '3', '4', '5', '6', '7', '8']
    if (validInts.includes(coordinate)) {
      dispatch(zoomDown(coordinate));
    } else {
      console.warn("coordinate found when zooming in wasn't valid");
    }
  });
  useHotkeys('h', () => {
    const element = document.querySelector("#middle");

    setTransform(0, -element.offsetWidth, 1, 300.0, "easeInCubic"); //Instantly go back to middle
  });

  console.log(renderedBoards);
  return <div className="game-wrapper" style={cssVars}>
    {renderedBoards}
  </div>;
};

export default App;