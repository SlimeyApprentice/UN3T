import React, { Component } from 'react';
import { useState } from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Board from './Board.jsx';

function initBoard(depth) {
  let state = {

  }

  for (let i = depth; i >= 0; i++) {
    // state[]
  }
}

function App() {
  const [xIsNext, setXIsNext] = useState(true);
  const [isWon, setIsWon] = useState(null);
  const depth = 1;

  const boardSize = 75;
  const borderSize = 2;

  const cssVars = {
    "--board-size": boardSize + "px",
    "--border-size": borderSize + "px"
  }

  const wrapper = (winningPlayer) => {
    setIsWon(winningPlayer);
    console.log(winningPlayer);
  }

  let state = initBoard(depth);

  return <div style={cssVars}>
  <TransformWrapper
    initialScale={1}
    maxScale={2}
    minScale={1}
    centerOnInit={true}
  >
    <TransformComponent>
    <Board depth={depth} xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={wrapper}/>
    </TransformComponent>
  </TransformWrapper>
  </div>;
};

export default App;