import React from "react";
import { TransformWrapper } from "react-zoom-pan-pinch";
import { useSelector } from "react-redux";

import process_input from "./controls";
import Board from "./Board";
import Renderer from "./Renderer";
import Minimap from "./Minimap";
import '../grid_board.css';

//Board width with padding * number of board + borders + top level borders + top level padding
// const calculated_width = ((boardSize + 20)*Math.pow(3, current_depth)) + ((borderSize*2)*(Math.pow(3, current_depth-1))) + (boardSize*2) + 20

function Game() {
    //All controls handled here, all hotkey hooks called
    process_input();

    //CSS variables and the CSS for the element we change dynamically
    const boardSize = useSelector((state) => state.game.boardSize);
    const borderSize = useSelector((state) => state.game.borderSize);
    const direction = useSelector((state) => state.control.direction);
    const window_width = useSelector((state) => state.control.window_width);

    var cssVars = {
        "display": "flex",
        "--board-size": boardSize + "px",
        "--border-size": borderSize + "px",
        "width": window_width,
        "flex-direction": direction,
    };

    //Convert props in state into components
    const renderBoards = useSelector((state) => state.control.renderBoards);
    let renderedBoards = [];
    for (const props of renderBoards) {
        renderedBoards.push(<Board {...props} />)
    }

    return <>
    <div className="game">
        <TransformWrapper
        initialScale={1}
        maxScale={2.5}
        minScale={1}
        disablePadding={true}
        centerOnInit={true}
        doubleClick={{disabled: true}}
        >
            <Renderer renderedBoards={renderedBoards} cssVars={cssVars} />
        </TransformWrapper>

        {/* <Minimap/> */}
    </div>
    </>;
};

export default Game;