import React from 'react';
import { useState, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSelector, useDispatch } from 'react-redux';

import Board from './Board.jsx';
import { switchTurn } from './state/gameSlice.jsx'
import { zoomUp, zoomDown } from './state/controlSlice.jsx'


function App() {
  const dispatch = useDispatch()

  const nearbyBoards = useSelector((state) => state.control.nearbyBoards);
  const current_depth = useSelector((state) => state.control.current_depth);
  const current_index = useSelector((state) => state.control.current_index);

  const boardSize = useSelector((state) => state.game.boardSize);
  const borderSize = useSelector((state) => state.game.borderSize);

  const globalBoard = useSelector((state) => state.game.globalBoard);

  const xIsNext = useSelector((state) => state.game.xIsNext);

  const [isWon, setIsWon] = useState(null);
  const wrapper = (winningPlayer) => {
    setIsWon(winningPlayer);
    console.log(winningPlayer);
  }

  function exampleexampletesttest(nextSquares, i, coordinates) {
    // console.log(coordinates);
    let reverse_coordinates = coordinates.reverse();
    
    let player;
    if (xIsNext) {
      player = "X"
    } else {
      player = "O";
    }
    dispatch(switchTurn())
    //Possibly redundant as it will read from init state
    nextSquares[i] = player; //Mutate state of component

    // useEffect(() => {
    //   fetch('https://api.example.com/data')
    //     .then(response => response.json())
    //     .then(json => setState(json))
    //     .catch(error => console.error(error));
    // }, []);

    // let new_state = JSON.parse(JSON.stringify(state));
    // recursiveEdit(new_state, reverse_coordinates, player);
    // setState(new_state); 
    // console.log("NEW STATE: ");
    // console.log(state.cells[4]);

    return;
  }

  // useHotkeys('w', () => {
  //   if (current_depth == depth || current_index < 3) { return }
  //   console.log("TRIGGER");

  //   //You'd do a transition from one to the other here

  //   setIdx(current_index-3);

  //   // setBoards(<Board depth={2} xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={wrapper}/>);
  //   // moveBoards(current_depth, current_index, "top", setBoards);
  // });

  const cssVars = {
    "--board-size": boardSize + "px",
    "--border-size": borderSize + "px",
    "width": "fit-content",
  };
  return <div style={cssVars}>
    {/* <div className='board-wrapper top-board'>
      {nearbyBoards.top && <Board depth={current_depth} xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={wrapper} initState={state.cells[current_index-3]}/>}
    </div>
    <div className='board-wrapper left-board'>
      {nearbyBoards.left && <Board depth={current_depth} xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={wrapper} initState={state.cells[current_index-1]}/>}
    </div> */}
    <div className='board-wrapper middle-board'>
      {nearbyBoards.middle && <Board depth={current_depth} coordinates={[4]} externalSetIsWon={wrapper}/>}
    </div>
    {/* <div className='board-wrapper right-board'>
      {nearbyBoards.right && <Board depth={current_depth} xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={wrapper} initState={state.cells[current_index+1]}/>}
    </div>
    <div className='board-wrapper bottom-board'>
      {nearbyBoards.bottom && <Board depth={current_depth} xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={wrapper} initState={state.cells[current_index+3]}/>}
    </div> */}
  </div>;
};

export default App;