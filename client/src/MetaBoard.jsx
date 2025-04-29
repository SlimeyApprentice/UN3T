import React from 'react';
import { useState } from 'react';
import Board from './Board.jsx';

function MetaBoard() {
  const [xIsNext, setXIsNext] = useState(true);
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isWon, setIsWon] = useState(null);

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

    setIsWon(calculateWinner(nextSquares));
  }

  return <div className="board meta">
  <div className='win-container'><span className={isWon}>{isWon}</span></div>
  <div className='board-row top-row'>
    <Board />
    <Board />
    <Board />
  </div>
  <div className='board-row center-row'>
    <Board />
    <Board />
    <Board />
  </div>
  <div className='board-row bottom-row'>
    <Board />
    <Board />
    <Board />
  </div>
  </div>;
};

export default MetaBoard;

function calculateWinner(squares) {
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
      return squares[a];
    }
  }
  return null;
}