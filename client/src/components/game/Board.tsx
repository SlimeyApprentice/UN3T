import { useSelector } from 'react-redux';

import Cell from './Cell.tsx';
import { BoardClass, GameWinState, Player, type BoardCells } from '../../state/types.ts';

import cross from '../../assets/Cross.svg' ;
import circle from '../../assets/Circle.svg';
import draw from '../../assets/Peace.svg' ;
import empty from '../../assets/Empty.svg' ;
// import type { RootState } from '../../state/store.ts';
import type { RootState } from '../../state/store.ts';
import { makeMoveServer, type Connection } from '../../serverInterface.ts';

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
  const current_depth = useSelector((state: RootState) => state.control.current_depth);
  const globalBoardCells = useSelector((state: RootState) => state.game.globalBoardCells);
  const globalBoard = new BoardClass(globalBoardCells);
  
  const currentPlayer = useSelector((state: RootState) => state.game.currentPlayer );

  const localBoardCells = globalBoard.getCell(coordinates) as BoardCells | Player;
  const localBoard = new BoardClass(localBoardCells);

  // console.log("Coordinates: " + coordinates + " and board: ");
  // console.log(localBoard)

  const isWon = localBoard.game_state;

  //If board over, pick from the following images
  let winElement;
  let winElementClassName = "off";
  switch(isWon) {
    case GameWinState.Cross:
      winElement = <img src={cross} className="X" style={gameStateStyle}/>;
      winElementClassName = " win-container-active"
      break;

    case GameWinState.Circle:
      winElement = <img src={circle} className="O" style={gameStateStyle}/>;
      winElementClassName = " win-container-active"
      break;

    case GameWinState.Draw: 
      winElement = <img src={draw} className="D" style={gameStateStyle}/>;
      winElementClassName = " win-container-active"
      break; 

    case GameWinState.Undecided:
      winElement = null;
      break;
  }

  //Top-level board
  let is_child_active = "";
  if (current_depth == depth) {
    is_child_active = "active-board";
  }

  const depth_class = "depth-" + depth;

  let coordinateClass = "";
  if (coordinates.length !== 0) {
    coordinateClass = coordinates[coordinates.length-1].toString();
  }

  const isWonClass = isWon ? "off " : "";

  const restriction = useSelector((state: RootState) => state.game.restriction);
  let isRestrictedClass = "";
  const strCoords = coordinates.toString().replaceAll(',', '');
  const strRsctn = restriction.toString().replaceAll(',', '');

  if (
    strCoords.indexOf(strRsctn) === 0 
    // || strCoords.indexOf(strRsctn) === strCoords.length - strRsctn.length
  ) {
    if (currentPlayer === Player.Cross) {
      isRestrictedClass = "restricted-red ";
    } else if (currentPlayer === Player.Circle){ //Else would mean currentPlayer = empty. Not good
      isRestrictedClass = "restricted-blue ";
    }
  } 

  if (depth == 0) {
    const squares = localBoard.leaf_board as Player[];

    //Base case, 0 recursion
    function handleClick(i: number) {
      if (isWon !== GameWinState.Undecided) { return; }

      if (squares[i] !== Player.Empty && squares[i] !== undefined) { return; }

      const new_coordinates = coordinates.slice().concat([i]);
      makeMoveServer(connection, new_coordinates);
    }

    // const UICells = [];
    // for (const idx of Array(9)) {
    //   UICells.push(<Cell value={squares[idx]} onSquareClick={() => handleClick(idx)} key={"cell-" + randomHex(16)}/>)
    // }

    //I like my code WET
    return <div className={"board " + depth_class + " " + className + " " + isRestrictedClass + " " + coordinateClass} id={id}>
      <div className={winElementClassName} style={{"zIndex": 1}}>
        {winElement}
      </div>
      {/* {UICells} */}

      <Cell value={squares[0]} onSquareClick={() => handleClick(0)} className={isWonClass}/>
      <Cell value={squares[1]} onSquareClick={() => handleClick(1)} className={isWonClass}/>
      <Cell value={squares[2]} onSquareClick={() => handleClick(2)} className={isWonClass}/>
      <Cell value={squares[3]} onSquareClick={() => handleClick(3)} className={isWonClass}/>
      <Cell value={squares[4]} onSquareClick={() => handleClick(4)} className={isWonClass}/>
      <Cell value={squares[5]} onSquareClick={() => handleClick(5)} className={isWonClass}/>
      <Cell value={squares[6]} onSquareClick={() => handleClick(6)} className={isWonClass}/>
      <Cell value={squares[7]} onSquareClick={() => handleClick(7)} className={isWonClass}/>
      <Cell value={squares[8]} onSquareClick={() => handleClick(8)} className={isWonClass}/>
    </div>;
  } else if (current_depth == depth + 2) {
    //If board too deep and won't render properly, put summary placeholder
    //Perhaps better to be based on size of board but it's difficult to know beforehand
    //I say that depth 3 is too big for now

    const count_result = localBoard.count;
    const is_cross_off = (count_result.cross == 0) ? 'off' : '';
    const is_circle_off = (count_result.circle == 0) ? 'off' : '';
    const is_empty_off = (is_cross_off !== "off" || is_circle_off !== "off") ? 'off' : '';

    //rgb(255, 120, 98)
    //rgb(150, 111, 255)
    const summary_style = {
      "background-color": "none"
    }
    if (count_result.cross != count_result.circle) {
      if (isRestrictedClass !== "") {
        console.log(coordinates, isRestrictedClass);
        summary_style["background-color"] = "var(--restriction-color)";
      }
      else if (count_result.cross > count_result.circle) {
        const alpha = (count_result.cross - count_result.circle) / count_result.empty;

        summary_style["background-color"] = `rgba(255, 120, 98, ${alpha+0.1})`;
      } else {
        const alpha = (count_result.circle - count_result.cross) / count_result.empty;

        summary_style["background-color"] = `rgba(150, 111, 255, ${alpha+0.1})`;
      }
    }

    //It would be better to give the is_child_active class here, maybe get to it later when messing with the css
    return <div className={"summary board meta " + depth_class + " " + className + " " + isRestrictedClass + " " + coordinateClass} id={id} style={summary_style}>
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
      //     className={isWonClass + is_child_active}
      //     connection={connection}
      //     key={"board-" + randomHex(16)}
      //   />)
      // }

      //It would be better to give the is_child_active class here, maybe get to it later when messing with the css
      return <div className={"board meta " + depth_class + " " + className + " " + isRestrictedClass + " " + coordinateClass} id={id}>
        <div className={winElementClassName} style={{"zIndex": depth+1}}>
          {winElement}
        </div>
        {/* {UIBoards} */}
        <Board depth={depth-1} coordinates={coordinates.slice().concat([0])} className={isWonClass + is_child_active} connection={connection}/>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([1])} className={isWonClass + is_child_active} connection={connection}/>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([2])} className={isWonClass + is_child_active} connection={connection}/>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([3])} className={isWonClass + is_child_active} connection={connection}/>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([4])} className={isWonClass + is_child_active} connection={connection}/>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([5])} className={isWonClass + is_child_active} connection={connection}/>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([6])} className={isWonClass + is_child_active} connection={connection}/>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([7])} className={isWonClass + is_child_active} connection={connection}/>
        <Board depth={depth-1} coordinates={coordinates.slice().concat([8])} className={isWonClass + is_child_active} connection={connection}/>
      </div>;
  }

};
export default Board;