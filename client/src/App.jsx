import React from 'react';
import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSelector, useDispatch } from 'react-redux';

import Board from './Board.jsx';
import { MAX_DEPTH, zoomUp, zoomDown } from './state/controlSlice.jsx'

function App() {
  const dispatch = useDispatch()

  const nearbyBoards = useSelector((state) => state.control.nearbyBoards);
  const current_depth = useSelector((state) => state.control.current_depth);
  const focus_coordinates = useSelector((state) => state.control.focus_coordinates);

  //CSS variables and the CSS for the element we change dynamically
  const boardSize = useSelector((state) => state.game.boardSize);
  const borderSize = useSelector((state) => state.game.borderSize);
  const [direction, setDirection] = useState("column");
  var cssVars = {
    "--board-size": boardSize + "px",
    "--border-size": borderSize + "px",
    "width": "fit-content",
    "display": "flex",
    "flex-direction": direction,
  };

  const [renderedBoards, setBoards] = useState([<Board depth={current_depth} coordinates={focus_coordinates} key={"middle"}/>]);
  //All the hotkeys
  useHotkeys('w', () => {
    if (current_depth == MAX_DEPTH || focus_coordinates[focus_coordinates.length-1] < 3 || renderedBoards.length > 1) { return }
    console.log("TRIGGER");

    // //You'd do a transition from one to the other here
    // dispatch(moveUp());

    let new_coords = focus_coordinates.slice();
    new_coords[new_coords.length-1] -= 3 

    let newBoards = [];
    newBoards.push(<Board depth={current_depth} coordinates={new_coords} key={"top"}/>);
    newBoards.push(<Board depth={current_depth} coordinates={focus_coordinates} key={"middle"}/>);
    setDirection("column");

    setBoards(newBoards);
  });
  useHotkeys('d', () => {
    if (current_depth == MAX_DEPTH || [2, 5, 8].includes(focus_coordinates[focus_coordinates.length-1]) || renderedBoards.length > 1) { return }
    console.log("TRIGGER");

    // //You'd do a transition from one to the other here
    // dispatch(moveUp());

    let new_coords = focus_coordinates.slice();
    new_coords[new_coords.length-1] += 1 

    let newBoards = [];
    newBoards.push(<Board depth={current_depth} coordinates={focus_coordinates} key={"middle"}/>);
    newBoards.push(<Board depth={current_depth} coordinates={new_coords} key={"right"}/>);
    setDirection("row");

    setBoards(newBoards);
  });
  
  useHotkeys('q', () => {
    if (current_depth == MAX_DEPTH) { return }

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

  console.log(renderedBoards);
  return <div className="game-wrapper" style={cssVars}>
    {renderedBoards}
{/* 
    <div className='board-wrapper top-board'>
      {nearbyBoards.middle && <Board depth={current_depth} coordinates={focus_coordinates} externalSetIsWon={wrapper}/>}
    </div>
    <div className='board-wrapper left-board'>
      {nearbyBoards.middle && <Board depth={current_depth} coordinates={focus_coordinates} externalSetIsWon={wrapper}/>}
    </div>
    <div className='board-wrapper middle-board'>
      {nearbyBoards.middle && <Board depth={current_depth} coordinates={focus_coordinates} externalSetIsWon={wrapper}/>}
    </div>
    <div className='board-wrapper right-board'>
      {nearbyBoards.middle && <Board depth={current_depth} coordinates={focus_coordinates} externalSetIsWon={wrapper}/>}
    </div>
    <div className='board-wrapper bottom-board'>
      {nearbyBoards.middle && <Board depth={current_depth} coordinates={focus_coordinates} externalSetIsWon={wrapper}/>}
    </div> */}
  </div>;
};

export default App;