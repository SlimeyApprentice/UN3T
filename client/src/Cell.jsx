import React from 'react';

function Cell({value, onSquareClick}) {
  return <>
    <button className='cell' onClick={onSquareClick}>{value}</button>
  </>;
};

export default Cell;