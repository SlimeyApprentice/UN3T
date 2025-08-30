import { TransformWrapper } from "react-zoom-pan-pinch";
import useWebSocket from "react-use-websocket";
import { useSelector } from "react-redux";

import type { RootState } from "../../state/store";
import useProcessInput from "./controls";
import Board from "./Board";
import Renderer from "./Renderer";
import './grid_board.css';

//Board width with padding * number of board + borders + top level borders + top level padding
// const calculated_width = ((boardSize + 20)*Math.pow(3, current_depth)) + ((borderSize*2)*(Math.pow(3, current_depth-1))) + (boardSize*2) + 20

function Game() {
    // This can also be an async getter function. See notes below on Async Urls.
    const { sendMessage } = useWebSocket("ws://localhost:8332", {
        protocols: "UN3T",
        //Will attempt to reconnect on all close events, such as server shutting down
        shouldReconnect: (_closeEvent) => true,
    });
    
    //All controls handled here, all hotkey hooks called
    useProcessInput();

    //CSS variables and the CSS for the element we change dynamically
    const boardSize = useSelector((state: RootState) => state.game.boardSize);
    const borderSize = useSelector((state: RootState) => state.game.borderSize);
    const direction = useSelector((state: RootState) => state.control.direction);
    const window_width = useSelector((state: RootState) => state.control.window_width);

    const cssVars = {
        "display": "flex",
        "--board-size": boardSize + "px",
        "--border-size": borderSize + "px",
        "width": window_width,
        "flex-direction": direction,
    };

    //Convert props in state into components
    const renderBoards = 
        useSelector((state: RootState) => state.control.renderBoards)
        .map((props, idx) =>  {
            return <Board {...props} sendMessage={sendMessage} key={"renderBoard" + idx}/>;
        });

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
            <Renderer renderedBoards={renderBoards} cssVars={cssVars} />
        </TransformWrapper>
    </div>
    </>;
};

export default Game;