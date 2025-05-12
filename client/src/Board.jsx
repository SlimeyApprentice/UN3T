import React from 'react';
import { useState } from 'react';
import Cell from './Cell.jsx';

import cross from './assets/Cross.svg' ;
import circle from './assets/Circle.svg';

function Board({depth, xIsNext, setXIsNext, externalSetIsWon}) {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isWon, setIsWon] = useState(null);

  //Used just for 0 recursion boards
  function handleClick(i) {
    const nextSquares = squares.slice();

    if (isWon != null) { return; }
    if (nextSquares[i] != null) { return; }

    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    setXIsNext(!xIsNext);
    setSquares(nextSquares);

    setIsWon(calculateWinner(nextSquares, externalSetIsWon, depth));
  }

  //1+ recursion
  function handleWin(i, winningPlayer) {
    const nextSquares = squares.slice();

    nextSquares[i] = winningPlayer;
    setSquares(nextSquares);

    setIsWon(calculateWinner(nextSquares, externalSetIsWon, depth));
  }

  if (depth == 0) {
    return <div className="board">
    <div className='win-container' style={{"zIndex": 1}}>
      {isWon}
    </div>
    <div className='board-row top-row'>
      <Cell value={squares[0]} onSquareClick={() => handleClick(0)}/>
      <Cell value={squares[1]} onSquareClick={() => handleClick(1)}/>
      <Cell value={squares[2]} onSquareClick={() => handleClick(2)}/>
    </div>
    <div className='board-row center-row'>
      <Cell value={squares[3]} onSquareClick={() => handleClick(3)}/>
      <Cell value={squares[4]} onSquareClick={() => handleClick(4)}/>
      <Cell value={squares[5]} onSquareClick={() => handleClick(5)}/>
    </div>
    <div className='board-row bottom-row'>
      <Cell value={squares[6]} onSquareClick={() => handleClick(6)}/>
      <Cell value={squares[7]} onSquareClick={() => handleClick(7)}/>
      <Cell value={squares[8]} onSquareClick={() => handleClick(8)}/>
    </div>
    </div>;
  } else {
      return <div className="board meta">
      <div className='win-container' style={{"zIndex": depth+1}}>
        {isWon}
      </div>
      <div className='board-row top-row'>
        <Board depth={depth-1} xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={(winningPlayer) => handleWin(0, winningPlayer)}/>
        <Board depth={depth-1} xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={(winningPlayer) => handleWin(1, winningPlayer)}/>
        <Board depth={depth-1} xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={(winningPlayer) => handleWin(2, winningPlayer)}/>
      </div>
      <div className='board-row center-row'>
        <Board depth={depth-1} xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={(winningPlayer) => handleWin(3, winningPlayer)}/>
        <Board depth={depth-1} xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={(winningPlayer) => handleWin(4, winningPlayer)}/>
        <Board depth={depth-1} xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={(winningPlayer) => handleWin(5, winningPlayer)}/>
      </div>
      <div className='board-row bottom-row'>
        <Board depth={depth-1} xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={(winningPlayer) => handleWin(6, winningPlayer)}/>
        <Board depth={depth-1} xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={(winningPlayer) => handleWin(7, winningPlayer)}/>
        <Board depth={depth-1} xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={(winningPlayer) => handleWin(8, winningPlayer)}/>
      </div>
      </div>;
  }

};

export default Board;

function calculateWinner(squares, externalSetIsWon, depth) {
  const style={
    "width": "100%",
    "height": "auto",
    // "top": (-8 + (16*depth)) + "px",
    "top": "0px",
  }

  if (!squares.includes(null)) {
    return <img src={cross} className="D" style={style}/>;
  }
    
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      externalSetIsWon(squares[a])

      if (squares[a] == 'X') {
        return <img src={cross} className="X" style={style}/>;
      } else {
        return <img src={circle} className="O" style={style}/>;
      }
    }
  }
  return null;
}