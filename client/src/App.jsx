import React from 'react';
import { useState } from 'react';
import Board from './Board.jsx';

function App() {
  const [xIsNext, setXIsNext] = useState(true);
  const [isWon, setIsWon] = useState(null);
  const depth = 5;

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

  return <div style={cssVars}>
  <Board depth={depth} xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={wrapper}/>
  </div>;
};

export default App;