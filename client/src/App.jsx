import React from 'react';
import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSelector, useDispatch } from 'react-redux';

import Board from './Board.jsx';
import { MAX_DEPTH, zoomUp, zoomDown, moveUp } from './state/controlSlice.jsx'

function App() {
  const dispatch = useDispatch()

  const nearbyBoards = useSelector((state) => state.control.nearbyBoards);
  const allBoards = useSelector((state) => state.control.allBoards);
  const current_depth = useSelector((state) => state.control.current_depth);
  const focus_coordinates = useSelector((state) => state.control.focus_coordinates);

  //All the hotkeys
  useHotkeys('w', () => {
    if (current_depth == MAX_DEPTH || focus_coordinates[focus_coordinates.length-1] < 3) { return }
    console.log("TRIGGER");

    //You'd do a transition from one to the other here
    dispatch(moveUp());
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

  //Handle the active boards and transitions
  //State guarantees only up to two active boards
  //HERE BE DRAGONS

  const boardSize = useSelector((state) => state.game.boardSize);
  const borderSize = useSelector((state) => state.game.borderSize);
  const cssVars = {
    "--board-size": boardSize + "px",
    "--border-size": borderSize + "px",
    "width": "fit-content",
    "display": "flex",
    "flex-direction": "column"
  };
  return <div className="game-wrapper" style={cssVars}>
    {allBoards}
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