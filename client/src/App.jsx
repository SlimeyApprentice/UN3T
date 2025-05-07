import React from 'react';
import { useState } from 'react';
import MetaBoard from './MetaBoard.jsx';

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

  return <div style={cssVars}>
  <MetaBoard depth={depth} boardSize={boardSize} xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={wrapper}/>
  </div>;
};

export default App;