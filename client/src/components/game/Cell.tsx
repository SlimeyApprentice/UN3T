import { Player } from '../../state/types.ts';

import cross from '../../assets/Thick_Cross.svg' ;
import circle from '../../assets/Thick_Circle.svg';

function get_image(value: Player) {
  if (value === Player.Cross) {
    return <img src={cross} className="move"/>;
  } else if (value == Player.Circle) {
    return <img src={circle} className="move"/>;
  } else {
    //Dummy
    return <div className="move dummy-move"/>
  }
}

type CellProps = {
  value: Player,
  onSquareClick: () => void,
  coords: string,
  className?: string,
}
function Cell({value, onSquareClick, coords, className}: CellProps) {
  const image = get_image(value);

  return <>
    <div className={'cell ' + className} onClick={onSquareClick} title={coords}>
      {image}
    </div>
  </>;
};

export default Cell;