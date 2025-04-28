import React from 'react';
import { useState } from 'react';

function Cell() {
  const [value, setValue] = useState('O');

  function handleClick() {
    if (value === 'O') {
      setValue('X');
    } else {
      setValue('O')
    }
  }

  return <>
    <button className='cell' onClick={handleClick}>{value}</button>
  </>;
};

export default Cell;