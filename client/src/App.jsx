import React, { Component } from 'react';
import { useState } from 'react';
import { useHotkeys, isHotkeyPressed } from 'react-hotkeys-hook';
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import Board from './Board.jsx';

function initBoard(depth) {
  let state = [];
  for (let i = 0; i < 9; i++) {
    if (depth > 0) {
      state[i] = initBoard(depth-1)
    } else {
      state[i] = null;
    }
  }

  return state
}

function App() {
  const [xIsNext, setXIsNext] = useState(true);
  const [isWon, setIsWon] = useState(null);
  const depth = 1;

  let current_depth = depth;
  let current_index = 0;

  const boardSize = 75;
  const borderSize = 2;

  const cssVars = {
    "--board-size": boardSize + "px",
    "--border-size": borderSize + "px",
    "width": "fit-content",
  }

  const wrapper = (winningPlayer) => {
    setIsWon(winningPlayer);
    console.log(winningPlayer);
  }

  let state = initBoard(depth);
  console.log(state);

  useHotkeys('w', () => {
    if (current_depth == dept && current_index < 3) { return }

    current_index -= 3;
  });

  return <div style={cssVars}>
    <Board depth={depth} xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={wrapper}/>
  </div>;
};

export default App;