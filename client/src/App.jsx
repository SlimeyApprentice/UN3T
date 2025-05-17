import React from 'react';
import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import Board from './Board.jsx';

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

function recursiveEdit(state, coordinates, value) {
  if (coordinates.length == 1) {
    state.cells[coordinates[0]] = value;
  } else {
    const next_coordinate = coordinates.pop()
    return recursiveEdit(state.cells[next_coordinate], coordinates, value)
  }
}

function App() {
  const [xIsNext, setXIsNext] = useState(true);
  const [isWon, setIsWon] = useState(null);
  const depth = 2;
  const wrapper = (winningPlayer) => {
    setIsWon(winningPlayer);
    console.log(winningPlayer);
  }
  const [current_depth, setDepth] = useState(depth-1);
  const [current_index, setIdx] = useState(4);
  const [nearbyBoards, showBoards] = useState({
    "top": false,
    "left": false,
    "middle": true,
    "right": false,
    "bottom": false,
  });
  let [state, setState] = useState(initBoard(depth));

  function makeMove(nextSquares, i, coordinates) {
    console.log(coordinates);
    let reverse_coordinates = coordinates.reverse();
  
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    setXIsNext(!xIsNext);
  
    let new_state = JSON.parse(JSON.stringify(state));
    recursiveEdit(new_state, reverse_coordinates, nextSquares[i]);
    setState(new_state); 

    return
  }

  const boardSize = 75;
  const borderSize = 2;

  const cssVars = {
    "--board-size": boardSize + "px",
    "--border-size": borderSize + "px",
    "width": "fit-content",
  }

  useHotkeys('w', () => {
    if (current_depth == depth || current_index < 3) { return }
    console.log("TRIGGER");

    //You'd do a transition from one to the other here

    setIdx(current_index-3);

    // setBoards(<Board depth={2} xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={wrapper}/>);
    // moveBoards(current_depth, current_index, "top", setBoards);
  });

  console.log(nearbyBoards);
  return <div style={cssVars}>
    {/* <div className='board-wrapper top-board'>
      {nearbyBoards.top && <Board depth={current_depth} xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={wrapper} initState={state.cells[current_index-3]}/>}
    </div>
    <div className='board-wrapper left-board'>
      {nearbyBoards.left && <Board depth={current_depth} xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={wrapper} initState={state.cells[current_index-1]}/>}
    </div> */}
    <div className='board-wrapper middle-board'>
      {nearbyBoards.middle && <Board depth={current_depth} makeMove={makeMove} coordinates={[4]} externalSetIsWon={wrapper} initState={state.cells[current_index]}/>}
    </div>
    {/* <div className='board-wrapper right-board'>
      {nearbyBoards.right && <Board depth={current_depth} xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={wrapper} initState={state.cells[current_index+1]}/>}
    </div>
    <div className='board-wrapper bottom-board'>
      {nearbyBoards.bottom && <Board depth={current_depth} xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={wrapper} initState={state.cells[current_index+3]}/>}
    </div> */}
  </div>;
};

export default App;