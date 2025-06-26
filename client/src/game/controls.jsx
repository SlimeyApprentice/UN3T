import { useHotkeys } from 'react-hotkeys-hook';
import { useDispatch, useSelector } from 'react-redux';

import { MAX_DEPTH, zoomUp, zoomDown, moveUp, moveLeft, moveDown, moveRight } from '../state/controlSlice.jsx'

//All we do here is get input, check it's a valid state to receive input, then call state
function process_input() {
  const dispatch = useDispatch()
  
  const current_depth = useSelector((state) => state.control.current_depth);
  const focus_coordinates = useSelector((state) => state.control.focus_coordinates);
  const renderBoards = useSelector((state) => state.control.renderBoards);


  //All the hotkeys
  useHotkeys('w', () => {
    if (current_depth == MAX_DEPTH || renderBoards.length > 1 || focus_coordinates[focus_coordinates.length-1] < 3) { return }
    dispatch(moveUp());
  });
  useHotkeys('a', () => {
    if (
      current_depth == MAX_DEPTH 
      || renderBoards.length > 1 
      || [0, 3, 6].includes(focus_coordinates[focus_coordinates.length-1]))
    { return }

    dispatch(moveLeft());
  });
  useHotkeys('s', () => {
    if (current_depth == MAX_DEPTH || renderBoards.length > 1 || focus_coordinates[focus_coordinates.length-1] > 5) { return }
    dispatch(moveDown());
  });
  useHotkeys('d', () => {
    if (
      current_depth == MAX_DEPTH 
      || renderBoards.length > 1 
      || [2, 5, 8].includes(focus_coordinates[focus_coordinates.length-1]))
    { return }
    
    dispatch(moveRight());
  });

  useHotkeys('q', () => {
    if (current_depth == MAX_DEPTH) { return }
    dispatch(zoomUp());
  });
  useHotkeys('e', () => {
    if (current_depth == 0) { return }

    const hoverElement = document.querySelector(".active-board:hover");

    if (hoverElement === null) { return }

    const coordinate = hoverElement.className[hoverElement.className.length - 1];

    const validInts = ['0', '1', '2', '3', '4', '5', '6', '7', '8']
    if (validInts.includes(coordinate)) {
      dispatch(zoomDown(coordinate));
    } else {
      console.warn("coordinate found when zooming in wasn't valid");
    }
  });
};

export default process_input;