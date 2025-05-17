import { useState } from 'react';

function initBoard(depth) {
  let state = {
    "cells": [],
    "game_state": null
  };
  for (let i = 0; i < 9; i++) {
    if (depth > 0) {
      state.cells[i] = initBoard(depth-1)
    } else {
      state.cells[i] = null;
    }
  }

  return state
}

class Config {
    //Default values constructor
    //LET'S HOPE ALL OF THIS IS PASS BY REFERENCE
    constructor() {
        const [xIsNext, setXIsNext] = useState(true);
        this.xIsNext = xIsNext;
        this.setXIsNext = setXIsNext;

        const [isWon, setIsWon] = useState(null);
        this.isWon = isWon;
        this.setIsWon = setIsWon;

        this.depth = 2;

        this.wrapper = (winningPlayer) => {
            setIsWon(winningPlayer);
            console.log(winningPlayer);
        }

        const [current_depth, setDepth] = useState(this.depth-1);
        this.current_depth = current_depth;
        this.setDepth = setDepth

        const [current_index, setIdx] = useState(4);
        this.current_index = current_index
        this.setIdx = setIdx;

        const [nearbyBoards, showBoards] = useState({
        "top": false,
        "left": false,
        "middle": true,
        "right": false,
        "bottom": false,
        });
        this.nearbyBoards = nearbyBoards
        this.showBoards = showBoards;

        let [state, setState] = useState(initBoard(this.depth));
        this.state = state
        this.setState = setState;
    }
}

export default Config