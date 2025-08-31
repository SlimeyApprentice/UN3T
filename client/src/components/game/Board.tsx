import { useSelector, useDispatch } from 'react-redux';

import Cell from './Cell.tsx';
import { makeMove } from '../../state/gameSlice.ts'
import { GameWinState, Player, type BoardData } from '../../state/types.ts';

import cross from '../../assets/Cross.svg' ;
import circle from '../../assets/Circle.svg';
import draw from '../../assets/Peace.svg' ;
import empty from '../../assets/Empty.svg' ;
import type { RootState } from '../../state/store.ts';
import { getTurnRestriction, leaveGame, newGame, type Connection } from '../../serverInterface.ts';

type PlayerCount = {
  cross: number,
  circle: number, 
  empty: number
}

function add_counts(res1: PlayerCount, res2: PlayerCount) {
  const result: PlayerCount = {
    cross: 0,
    circle: 0,
    empty: 0
  }

  //Probably a cleaner prototype method out there
  result.cross = res1.cross + res2.cross;
  result.circle = res1.circle + res2.circle;
  result.empty = res1.empty + res2.empty;

  return result;
}

function recursiveCount(board: BoardData) {
  let result: PlayerCount = {
    cross: 0,
    circle: 0,
    empty: 0,
  }

  //Recursive step
  // if (typeof(board.cells[0]) === "object" && board.cells[0] !== null) {
  if (typeof(board.cells[0]) === "object") {
    for (const subBoard of board.cells) {
      result = add_counts(result, recursiveCount(subBoard as BoardData));
    }
    return result;
  } 
  //Base step
  else {
    for (const cell of board.cells) {
      switch (cell) {
        case Player.Cross:
          result.cross++;
          break;
        case Player.Circle:
          result.circle++;
          break;
        case Player.Empty:
          result.empty++;
          break;
      }
    }

    return result;
  }
}

function randomHex(size: number) {
  return [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

//Should try to remove
const gameStateStyle={
  "width": "100%",
  "height": "auto",
  // "top": (-8 + (16*depth)) + "px",
  "top": "0px",
}
type BoardProps = {
  depth: number,
  coordinates: number[],
  className: string,
  connection: Connection,
  id?: string,
}
function Board({depth, coordinates, className, connection, id }: BoardProps) {
  const dispatch = useDispatch()

  const current_depth = useSelector((state: RootState) => state.control.current_depth );
  const globalBoard = useSelector((state: RootState) => state.game.globalBoard );

  let localBoard = globalBoard;
  for (const i of coordinates) {
    localBoard = localBoard.cells[i] as BoardData;
  }

  //Is this being updated?
  // console.log(localBoard);
  const isWon = localBoard.game_state;

  //If board over, pick from the following images
  let winElement;
  let winElementClassName = "off";
  if (isWon == GameWinState.Cross) {
    winElement = <img src={cross} className="X" style={gameStateStyle}/>;
    winElementClassName += " win-container-active"
  } else if (isWon == GameWinState.Circle) {
    winElement = <img src={circle} className="O" style={gameStateStyle}/>;
    winElementClassName += " win-container-active"
  } else if (isWon == GameWinState.Draw) {
    winElement = <img src={draw} className="D" style={gameStateStyle}/>;
    winElementClassName += " win-container-active"
  } else if (isWon == GameWinState.Undecided) {
    winElement = null;
  }

  //Top-level board
  let is_child_active = "";
  if (current_depth == depth) {
    is_child_active = "active-board";
  }

  const depth_class = "depth-" + depth;

  let coordinateClass = "";
  if (coordinates.length != 0) {
    coordinateClass = coordinates[coordinates.length-1].toString();
  }

  if (depth == 0) {
    const squares = localBoard.cells as Player[];

    //Base case, 0 recursion
    function handleClick(i: number) {
      if (isWon !== GameWinState.Undecided) { return; }
      if (squares[i] !== Player.Empty) { return; }

      console.log("BBBBBBBB");

      dispatch(makeMove());

      const new_coordinates = coordinates.slice().concat([i]);

      const test = getTurnRestriction(connection);
      console.log(test);
    }

    // const UICells = [];
    // for (const idx of Array(9)) {
    //   UICells.push(<Cell value={squares[idx]} onSquareClick={() => handleClick(idx)} key={"cell-" + randomHex(16)}/>)
    // }

    //I like my code WET
    return <div className={"board " + depth_class + " " + className + " " + coordinateClass} id={id}>
      <div className={winElementClassName} style={{"zIndex": 1}}>
        {winElement}
      </div>
      {/* {UICells} */}

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
    const is_cross_off = (count_result.cross == 0) ? 'off' : '';
    const is_circle_off = (count_result.circle == 0) ? 'off' : '';
    const is_empty_off = (is_cross_off !== "off" || is_circle_off !== "off") ? 'off' : '';

    //rgb(255, 120, 98)
    //rgb(150, 111, 255)
    const summary_style = {
      "background-color": "none"
    }
    if (count_result.cross != count_result.circle) {
      if (count_result.cross > count_result.circle) {
        const alpha = (count_result.cross - count_result.circle) / count_result.empty;

        summary_style["background-color"] = `rgba(255, 120, 98, ${alpha+0.1})`;
      } else {
        const alpha = (count_result.circle - count_result.cross) / count_result.empty;

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

    <span className={'move-count ' + is_cross_off}>{count_result.cross}</span> 
    <span className={'move-count ' + is_circle_off}>{count_result.circle}</span> 

    <img src={empty} className={'summary-image empty-image ' + is_empty_off}/>

    </div>;
  } else {
      // const UIBoards = [];
      // for (const idx of Array(9)) {
      //   UIBoards.push(<Board 
      //     depth={depth-1} 
      //     coordinates={coordinates.slice().concat([idx])} 
      //     className={is_child_active}
      //     connection={connection}
      //     key={"board-" + randomHex(16)}
      //   />)
      // }

      //It would be better to give the is_child_active class here, maybe get to it later when messing with the css
      return <div className={"board meta " + depth_class + " " + className + " " + coordinateClass} id={id}>
        <div className={winElementClassName} style={{"zIndex": depth+1}}>
          {winElement}
        </div>
        {/* {UIBoards} */}
        <Board depth={depth-1} coordinates={coordinates.slice().concat([0])} className={is_child_active} connection={connection}/>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([1])} className={is_child_active} connection={connection}/>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([2])} className={is_child_active} connection={connection}/>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([3])} className={is_child_active} connection={connection}/>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([4])} className={is_child_active} connection={connection}/>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([5])} className={is_child_active} connection={connection}/>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([6])} className={is_child_active} connection={connection}/>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([7])} className={is_child_active} connection={connection}/>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([8])} className={is_child_active} connection={connection}/>
      </div>;
  }

};
export default Board;