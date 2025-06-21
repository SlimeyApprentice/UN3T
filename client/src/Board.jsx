import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Cell from './Cell.jsx';
import { makeMove } from './state/gameSlice.jsx'

import cross from './assets/Cross.svg' ;
import circle from './assets/Circle.svg';
import draw from './assets/Peace.svg' ;
// import draw from './assets/CrossCircle.svg' ;
// import draw from './assets/Square.svg' ;

const GameState = {
  CROSS: "X",
  CIRCLE: "O",
  DRAW: "D",
  UNDECIDED: null
};

const gameStateStyle={
  "width": "100%",
  "height": "auto",
  // "top": (-8 + (16*depth)) + "px",
  "top": "0px",
}

function Board({depth, coordinates, externalSetIsWon}) {
  const dispatch = useDispatch()

  // console.log("GLOBAL BOARD: ");
  const globalBoard = useSelector((state) => state.game.globalBoard );

  let localBoard = globalBoard;
  for (const i of coordinates) {
    localBoard = localBoard.cells[i];
  }

  // if (coordinates[1] == 0) {
  //   console.log("LOCAL BOARD");
  //   console.log(localBoard);
  //   console.log("LOCAL BOARDS COORDINATES: ");
  //   console.log(coordinates);
  // }

  //Is this being updated?
  const squares = localBoard.cells;
  const isWon = localBoard.game_state;

  //If board over, pick from the following images
  let winElement;
  if (isWon == GameState.CROSS) {
    winElement = <img src={cross} className="X" style={gameStateStyle}/>;
  } else if (isWon == GameState.CIRCLE) {
    winElement = <img src={circle} className="O" style={gameStateStyle}/>;
  } else if (isWon == GameState.DRAW) {
    winElement = <img src={draw} className="D" style={gameStateStyle}/>;
  } else if (isWon == GameState.UNDECIDED) {
    winElement = null;
  }

  //Base case, 0 recursion
  function handleClick(i) {
    if (isWon != null) { return; }
    if (squares[i] != null) { return; }

    dispatch(makeMove(coordinates.slice().concat([i])));
  }

  // // Suspended as this won't be used when API works and it's a pain to get working rn
  // //Recursive step, 1+ recursion
  // function handleWin(i, winningPlayer) {
  //   const nextSquares = squares.slice();

  //   nextSquares[i] = winningPlayer;
  //   setSquares(nextSquares);

  //   const result = calculateWinner(nextSquares, externalSetIsWon);
  //   console.log("RESULT: " + result);
  //   let element;
  //   if (result == GameState.CROSS) {
  //     element = <img src={cross} className="X" style={gameStateStyle}/>;
  //   } else if (result == GameState.CIRCLE) {
  //     element = <img src={circle} className="O" style={gameStateStyle}/>;
  //   } else if (result == GameState.DRAW) {
  //     element = <img src={draw} className="D" style={gameStateStyle}/>;
  //   } else if (result == GameState.UNDECIDED) {
  //     element = null;
  //   }
  //   setIsWon(element);

  //   // setIsWon(calculateWinner(nextSquares, externalSetIsWon));
  // }

  //I like my code WET
  if (depth == 0) {
    // let newSquares = globalBoard.cells[4].cells[0].cells;
    let newSquares = squares;

    // if (coordinates[0] == 0) {
    //   console.log("SQUARES: ");
    //   console.log(newSquares);
    // }

    return <div className="board">
    <div className='win-container' style={{"zIndex": 1}}>
      {winElement}
    </div>
    {/* <div className='board-row top-row'>
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
    </div> */}
        <div className='board-row top-row'>
      <Cell value={newSquares[0]} onSquareClick={() => handleClick(0)}/>
      <Cell value={newSquares[1]} onSquareClick={() => handleClick(1)}/>
      <Cell value={newSquares[2]} onSquareClick={() => handleClick(2)}/>
    </div>
    <div className='board-row center-row'>
      <Cell value={newSquares[3]} onSquareClick={() => handleClick(3)}/>
      <Cell value={newSquares[4]} onSquareClick={() => handleClick(4)}/>
      <Cell value={newSquares[5]} onSquareClick={() => handleClick(5)}/>
    </div>
    <div className='board-row bottom-row'>
      <Cell value={newSquares[6]} onSquareClick={() => handleClick(6)}/>
      <Cell value={newSquares[7]} onSquareClick={() => handleClick(7)}/>
      <Cell value={newSquares[8]} onSquareClick={() => handleClick(8)}/>
    </div>
    </div>;
  } else {
      return <div className="board meta">
      <div className='win-container' style={{"zIndex": depth+1}}>
        {winElement}
      </div>
      <div className='board-row top-row'>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([0])} externalSetIsWon={(winningPlayer) => handleWin(0, winningPlayer)} />
        <Board depth={depth-1} coordinates={coordinates.slice().concat([1])} externalSetIsWon={(winningPlayer) => handleWin(1, winningPlayer)} />
        <Board depth={depth-1} coordinates={coordinates.slice().concat([2])} externalSetIsWon={(winningPlayer) => handleWin(2, winningPlayer)} />
      </div>
      <div className='board-row center-row'>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([3])} externalSetIsWon={(winningPlayer) => handleWin(3, winningPlayer)} />
        <Board depth={depth-1} coordinates={coordinates.slice().concat([4])} externalSetIsWon={(winningPlayer) => handleWin(4, winningPlayer)} />
        <Board depth={depth-1} coordinates={coordinates.slice().concat([5])} externalSetIsWon={(winningPlayer) => handleWin(5, winningPlayer)} />
      </div>
      <div className='board-row bottom-row'>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([6])} externalSetIsWon={(winningPlayer) => handleWin(6, winningPlayer)} />
        <Board depth={depth-1} coordinates={coordinates.slice().concat([7])} externalSetIsWon={(winningPlayer) => handleWin(7, winningPlayer)} />
        <Board depth={depth-1} coordinates={coordinates.slice().concat([8])} externalSetIsWon={(winningPlayer) => handleWin(8, winningPlayer)} />
      </div>
      </div>;
  }

};
export default Board;

//externalSetIsWon not really necessary
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

      if (squares[a] == 'X') {
        return GameState.CROSS;
      } else {
        return GameState.CIRCLE;
      }
    }
  }

  const has_space = squares.some((x) => { 
      if (x === null || x.game_state === null) { 
        return true; 
      }

      return false;
    });

  console.log("Has space? : " + has_space);
  console.log(squares);
  //Regular check for a draw
  if (has_space == false) {
    externalSetIsWon("D")
    return GameState.DRAW;
  }

  return GameState.UNDECIDED;
}