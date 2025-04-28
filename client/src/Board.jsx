import React from 'react';
import Cell from './Cell.jsx';

function Board() {
  return <div className='board'>
  <div className='board-row top-row'>
    <Cell/>
    <Cell/>
    <Cell/>
  </div>
  <div className='board-row center-row'>
    <Cell/>
    <Cell/>
    <Cell/>
  </div>
  <div className='board-row bottom-row'>
    <Cell/>
    <Cell/>
    <Cell/>
  </div>
  </div>;
};

export default Board;