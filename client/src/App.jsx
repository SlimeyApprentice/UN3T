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
  //Kinda hacky? I don't think zoom-pan-pinch lets you increment transform by itself
  useHotkeys('w', () => {
    // if (isHotkeyPressed('w') == false) { return; }

    let [x_pos, y_pos, scale] = get_pos();    
    setTransform(x_pos, y_pos+10, scale);
  });
  useHotkeys('a', () => {
    // if (isHotkeyPressed('w') == false) { return; }

    let [x_pos, y_pos, scale] = get_pos();    
    setTransform(x_pos+10, y_pos, scale);
  });
  useHotkeys('s', () => {
    // if (isHotkeyPressed('w') == false) { return; }

    let [x_pos, y_pos, scale] = get_pos();    
    setTransform(x_pos, y_pos-10, scale);
  });
  useHotkeys('d', () => {
    // if (isHotkeyPressed('w') == false) { return; }

    let [x_pos, y_pos, scale] = get_pos();    
    setTransform(x_pos-10, y_pos, scale);
  });
  
  return <div style={cssVars}>
    <Board depth={depth} xIsNext={xIsNext} setXIsNext={setXIsNext} externalSetIsWon={wrapper}/>
  </div>;
};

export default App;