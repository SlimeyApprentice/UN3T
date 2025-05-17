import React from 'react';
import { useState } from 'react';
import Cell from './Cell.jsx';

import cross from './assets/Cross.svg' ;
import circle from './assets/Circle.svg';
import draw from './assets/Peace.svg' ;
// import draw from './assets/CrossCircle.svg' ;
// import draw from './assets/Square.svg' ;

function Board({depth, makeMove, coordinates, externalSetIsWon, initState}) {
  const [squares, setSquares] = useState(initState.cells);
  const [isWon, setIsWon] = useState(initState.game_state);

  //Used just for 0 recursion boards
  function handleClick(i) {
    const nextSquares = squares.slice();

    if (isWon != null) { return; }
    if (nextSquares[i] != null) { return; }

    makeMove(nextSquares, i, coordinates);
    setSquares(nextSquares);

    setIsWon(calculateWinner(nextSquares, externalSetIsWon));
  }

  //1+ recursion
  function handleWin(i, winningPlayer) {
    const nextSquares = squares.slice();

    nextSquares[i] = winningPlayer;
    setSquares(nextSquares);

    setIsWon(calculateWinner(nextSquares, externalSetIsWon));
  }

  //I like my code WET
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
        <Board depth={depth-1} makeMove={makeMove} coordinates={coordinates.slice().concat([0])} externalSetIsWon={(winningPlayer) => handleWin(0, winningPlayer)} initState={initState.cells[0]}/>
        <Board depth={depth-1} makeMove={makeMove} coordinates={coordinates.slice().concat([1])} externalSetIsWon={(winningPlayer) => handleWin(1, winningPlayer)} initState={initState.cells[1]}/>
        <Board depth={depth-1} makeMove={makeMove} coordinates={coordinates.slice().concat([2])} externalSetIsWon={(winningPlayer) => handleWin(2, winningPlayer)} initState={initState.cells[2]}/>
      </div>
      <div className='board-row center-row'>
        <Board depth={depth-1} makeMove={makeMove} coordinates={coordinates.slice().concat([3])} externalSetIsWon={(winningPlayer) => handleWin(3, winningPlayer)} initState={initState.cells[3]}/>
        <Board depth={depth-1} makeMove={makeMove} coordinates={coordinates.slice().concat([4])} externalSetIsWon={(winningPlayer) => handleWin(4, winningPlayer)} initState={initState.cells[4]}/>
        <Board depth={depth-1} makeMove={makeMove} coordinates={coordinates.slice().concat([5])} externalSetIsWon={(winningPlayer) => handleWin(5, winningPlayer)} initState={initState.cells[5]}/>
      </div>
      <div className='board-row bottom-row'>
        <Board depth={depth-1} makeMove={makeMove} coordinates={coordinates.slice().concat([6])} externalSetIsWon={(winningPlayer) => handleWin(6, winningPlayer)} initState={initState.cells[6]}/>
        <Board depth={depth-1} makeMove={makeMove} coordinates={coordinates.slice().concat([7])} externalSetIsWon={(winningPlayer) => handleWin(7, winningPlayer)} initState={initState.cells[7]}/>
        <Board depth={depth-1} makeMove={makeMove} coordinates={coordinates.slice().concat([8])} externalSetIsWon={(winningPlayer) => handleWin(8, winningPlayer)} initState={initState.cells[8]}/>
      </div>
      </div>;
  }

};

export default Board;

//externalSetIsWon not really necessary
function calculateWinner(squares, externalSetIsWon) {
  const style={
    "width": "100%",
    "height": "auto",
    // "top": (-8 + (16*depth)) + "px",
    "top": "0px",
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

  if (!squares.includes(null)) {
    return <img src={draw} className="D" style={style}/>;
  }

  return null;
}