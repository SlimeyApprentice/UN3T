import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Cell from './Cell.jsx';
import { makeMove } from '../state/gameSlice.jsx'

import cross from '../assets/Cross.svg' ;
import circle from '../assets/Circle.svg';
import draw from '../assets/Peace.svg' ;
// import draw from './assets/CrossCircle.svg' ;
// import draw from './assets/Square.svg' ;
import empty from '../assets/Empty.svg' ;

function add_counts(res1, res2) {
  let result = {
    cross_count: 0,
    circle_count: 0,
    empty_count: 0
  }

  //Probably a cleaner prototype method out there
  result.cross_count = res1.cross_count + res2.cross_count;
  result.circle_count = res1.circle_count + res2.circle_count;
  result.empty_count = res1.empty_count + res2.empty_count;

  return result;
}

function recursiveCount(board) {
  let result = {
    cross_count: 0,
    circle_count: 0,
    empty_count: 0,
  }

  //Recursive step
  if (typeof(board.cells[0]) === "object" && board.cells[0] !== null) {
    for (const subBoard of board.cells) {
      result = add_counts(result, recursiveCount(subBoard));
    }
    return result;
  } 
  //Base step
  else {
    for (const cell of board.cells) {
      switch (cell) {
        case "X":
          result.cross_count++;
          break;
        case "O":
          result.circle_count++;
          break;
        case null:
          result.empty_count++;
          break;
      }
    }

    return result;
  }
}

const GameState = {
  CROSS: "X",
  CIRCLE: "O",
  DRAW: "D",
  UNDECIDED: null
};

//Should try to remove
const gameStateStyle={
  "width": "100%",
  "height": "auto",
  // "top": (-8 + (16*depth)) + "px",
  "top": "0px",
}

function Board({depth, coordinates, className, id}) {
  const dispatch = useDispatch()

  const current_depth = useSelector((state) => state.control.current_depth );
  const globalBoard = useSelector((state) => state.game.globalBoard );

  let localBoard = globalBoard;
  for (const i of coordinates) {
    localBoard = localBoard.cells[i];
  }

  //Is this being updated?
  const squares = localBoard.cells;
  const isWon = localBoard.game_state;

  //If board over, pick from the following images
  let winElement;
  let winElementClassName = "off";
  if (isWon == GameState.CROSS) {
    winElement = <img src={cross} className="X" style={gameStateStyle}/>;
    winElementClassName += " win-container-active"
  } else if (isWon == GameState.CIRCLE) {
    winElement = <img src={circle} className="O" style={gameStateStyle}/>;
    winElementClassName += " win-container-active"
  } else if (isWon == GameState.DRAW) {
    winElement = <img src={draw} className="D" style={gameStateStyle}/>;
    winElementClassName += " win-container-active"
  } else if (isWon == GameState.UNDECIDED) {
    winElement = null;
  }

  //Base case, 0 recursion
  function handleClick(i) {
    if (isWon !== null) { return; }
    if (squares[i] !== null) { return; }

    dispatch(makeMove(coordinates.slice().concat([i])));
  }

  //Top-level board
  let is_child_active = "";
  if (current_depth == depth) {
    is_child_active = "active-board";
  }

  let depth_class = "depth-" + depth;

  let coordinateClass = "";
  if (coordinates.length != 0) {
    coordinateClass = coordinates[coordinates.length-1];
  }

  //I like my code WET
  if (depth == 0) {
    return <div className={"board " + depth_class + " " + className + " " + coordinateClass} id={id}>
    <div className={winElementClassName} style={{"zIndex": 1}}>
      {winElement}
    </div>
      <Cell value={squares[0]} onSquareClick={() => handleClick(0)}/>
      <Cell value={squares[1]} onSquareClick={() => handleClick(1)}/>
      <Cell value={squares[2]} onSquareClick={() => handleClick(2)}/>
      <Cell value={squares[3]} onSquareClick={() => handleClick(3)}/>
      <Cell value={squares[4]} onSquareClick={() => handleClick(4)}/>
      <Cell value={squares[5]} onSquareClick={() => handleClick(5)}/>
      <Cell value={squares[6]} onSquareClick={() => handleClick(6)}/>
      <Cell value={squares[7]} onSquareClick={() => handleClick(7)}/>
      <Cell value={squares[8]} onSquareClick={() => handleClick(8)}/>
    </div>;
  } else if (current_depth == depth + 2) {
    //If board too deep and won't render properly, put summary placeholder
    //Perhaps better to be based on size of board but it's difficult to know beforehand
    //I say that depth 3 is too big for now

    const count_result = recursiveCount(localBoard);
    const is_cross_off = (count_result.cross_count == 0) ? 'off' : '';
    const is_circle_off = (count_result.circle_count == 0) ? 'off' : '';
    const is_empty_off = (is_cross_off !== "off" || is_circle_off !== "off") ? 'off' : '';

    //rgb(255, 120, 98)
    //rgb(150, 111, 255)
    let summary_style = {
      "background-color": "none"
    }
    if (count_result.cross_count != count_result.circle_count) {
      if (count_result.cross_count > count_result.circle_count) {
        const alpha = (count_result.cross_count - count_result.circle_count) / count_result.empty_count;

        summary_style["background-color"] = `rgba(255, 120, 98, ${alpha+0.1})`;
      } else {
        const alpha = (count_result.circle_count - count_result.cross_count) / count_result.empty_count;

        summary_style["background-color"] = `rgba(150, 111, 255, ${alpha+0.1})`;
      }
    }

    //It would be better to give the is_child_active class here, maybe get to it later when messing with the css
    return <div className={"summary board meta " + depth_class + " " + className + " " + coordinateClass} id={id} style={summary_style}>
    <div className={winElementClassName} style={{"zIndex": depth+1}}>
      {winElement}
    </div>
    <img src={cross} className={'summary-image ' + is_cross_off}/>
    <img src={circle} className={'summary-image ' + is_circle_off}/>

    <span className={'move-count ' + is_cross_off}>{count_result.cross_count}</span> 
    <span className={'move-count ' + is_circle_off}>{count_result.circle_count}</span> 

    <img src={empty} className={'summary-image empty-image ' + is_empty_off}/>

    </div>;
  } else {
      //It would be better to give the is_child_active class here, maybe get to it later when messing with the css
      return <div className={"board meta " + depth_class + " " + className + " " + coordinateClass} id={id}>
      <div className={winElementClassName} style={{"zIndex": depth+1}}>
        {winElement}
      </div>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([0])} className={is_child_active}/>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([1])} className={is_child_active}/>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([2])} className={is_child_active}/>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([3])} className={is_child_active}/>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([4])} className={is_child_active}/>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([5])} className={is_child_active}/>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([6])} className={is_child_active}/>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([7])} className={is_child_active}/>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([8])} className={is_child_active}/>
      </div>;
  }

};
export default Board;