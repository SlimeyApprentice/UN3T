import React from 'react';
import { useState } from 'react';
import Board from './Board.jsx';

function MetaBoard({depth, boardSize, xIsNext, setXIsNext, externalSetIsWon}) {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isWon, setIsWon] = useState(null);

  // function handleClick(i) {
  //   const nextSquares = squares.slice();

  //   if (isWon != null) { return; }
  //   if (nextSquares[i] != null) { return; }

  //   if (xIsNext) {
  //     nextSquares[i] = "X";
  //   } else {
  //     nextSquares[i] = "O";
  //   }
  //   setXIsNext(!xIsNext);
  //   setSquares(nextSquares);

  //   setIsWon(calculateWinner(nextSquares));
  // }

  function handleWin(i, winningPlayer) {
    const nextSquares = squares.slice();

    nextSquares[i] = winningPlayer;
    setSquares(nextSquares);

    setIsWon(calculateWinner(nextSquares, externalSetIsWon))
  }

  const newBoardSize = 2 * boardSize * (depth+1) + 'px'

  return <div className="board meta">
  <div className='win-container'><span className={isWon} style={{
    "width": "inherit",
    "fontSize": newBoardSize,
    "zIndex": depth+1,
    "background-color": "rgba(1, 1, 1, 0.4)"
  }}>{isWon}</span></div>
  <div className='board-row top-row'>
    <Board xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={(winningPlayer) => handleWin(0, winningPlayer)}/>
    <Board xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={(winningPlayer) => handleWin(1, winningPlayer)}/>
    <Board xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={(winningPlayer) => handleWin(2, winningPlayer)}/>
  </div>
  <div className='board-row center-row'>
    <Board xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={(winningPlayer) => handleWin(3, winningPlayer)}/>
    <Board xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={(winningPlayer) => handleWin(4, winningPlayer)}/>
    <Board xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={(winningPlayer) => handleWin(5, winningPlayer)}/>
  </div>
  <div className='board-row bottom-row'>
    <Board xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={(winningPlayer) => handleWin(6, winningPlayer)}/>
    <Board xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={(winningPlayer) => handleWin(7, winningPlayer)}/>
    <Board xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={(winningPlayer) => handleWin(8, winningPlayer)}/>
  </div>
  </div>;
};

export default MetaBoard;

function calculateWinner(squares, externalSetIsWon) {
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
      return squares[a];
    }
  }
  return null;
}