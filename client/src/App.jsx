import React, { Component } from 'react';
import { useState } from 'react';
import { useHotkeys, isHotkeyPressed } from 'react-hotkeys-hook';
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import Board from './Board.jsx';

function initBoard(depth) {
  let state = {

  }

  for (let i = depth; i >= 0; i++) {
    // state[]
  }
}

function get_pos() {
  let element = document.querySelector(".react-transform-component");
  let x_pos = Number(element.style["transform"].split("px")[0].split("(")[1]);
  let y_pos = Number(element.style["transform"].split("px")[1].split(",")[1]);

  let scale_idx = element.style["transform"].indexOf("scale(");
  let scale = Number(element.style["transform"].substring(scale_idx+6).split(")")[0])

  console.log(element.style["transform"].split("px"));
  console.log(scale);

  if (isNaN(x_pos)) { x_pos = 0 }
  if (isNaN(y_pos)) { y_pos = 0 }

  return [x_pos, y_pos, scale];
}

function App() {
  const [xIsNext, setXIsNext] = useState(true);
  const [isWon, setIsWon] = useState(null);
  const [isHeld, setIsHeld] = useState({
    "w": false,
    "a": false,
    "s": false,
    "d": false
  });
  const { setTransform } = useControls();
  const depth = 1;

  const boardSize = 75;
  const borderSize = 2;

  const cssVars = {
    "--board-size": boardSize + "px",
    "--border-size": borderSize + "px",
    "width": "fit-content",
  }

  const wrapper = (winningPlayer) => {
    setIsWon(winningPlayer);
    console.log(winningPlayer);
  }

  // let state = initBoard(depth);
  
  addEventListener("keydown", (event) => { 
    let newIsHeld = isHeld;
    newIsHeld[event.key] = true; 
    setIsHeld(newIsHeld);
  });
  addEventListener("keyup", (event) => { 
    let newIsHeld = isHeld;
    newIsHeld[event.key] = false; 
    setIsHeld(newIsHeld);
  });

  setInterval(() => {
    //See if this lags out
    // let [x_pos, y_pos, scale] = get_pos();    

    if (isHeld["w"] == true) {
      let [x_pos, y_pos, scale] = get_pos();    
      setTransform(x_pos, y_pos+10, scale);
    } else if (isHeld["a"] == true) {
      let [x_pos, y_pos, scale] = get_pos();    
      setTransform(x_pos+10, y_pos, scale);
    } else if (isHeld["s"] == true) {
      let [x_pos, y_pos, scale] = get_pos();    
      setTransform(x_pos, y_pos-10, scale);
    } else if (isHeld["d"] == true) {
      let [x_pos, y_pos, scale] = get_pos();    
      setTransform(x_pos-10, y_pos, scale);
    }
  }, 100);

  return <div style={cssVars}>
    <Board depth={depth} xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={wrapper}/>
  </div>;
};

export default App;