import React from 'react';

import cross from '../assets/Thick_Cross.svg' ;
import circle from '../assets/Thick_Circle.svg';

function get_image(value) {
  if (value === "X") {
    return <img src={cross} className="move"/>;
  } else if (value == "O") {
    return <img src={circle} className="move"/>;
  } else {
    //Dummy
    return <div className="move dummy-move"/>
  }
}

function Cell({value, onSquareClick}) {
  const image = get_image(value);

  return <>
    <div className='cell' onClick={onSquareClick}>
      {image}
    </div>
  </>;
};

export default Cell;