import { TransformWrapper } from "react-zoom-pan-pinch";
import { useSelector } from "react-redux";

import { getTurn, joinGame, scanGame, useProcessServer, type Connection } from "../../serverInterface";
import type { RootState } from "../../state/store";
import useProcessInput from "./controls";
import Board from "./Board";
import Renderer from "./Renderer";
import './grid_board.css';
import { useEffect } from "react";
import type { GameState } from "../../state/types";

//Board width with padding * number of board + borders + top level borders + top level padding
// const calculated_width = ((boardSize + 20)*Math.pow(3, current_depth)) + ((borderSize*2)*(Math.pow(3, current_depth-1))) + (boardSize*2) + 20

type GameProps = {
    connection: Connection,
}
function Game({connection}: GameProps) {
    // All controls handled here, all hotkey hooks called
    useProcessInput();
    // Handles changing global state according to server response
    useProcessServer(connection);

    // CSS variables and the CSS for the element we change dynamically
    const boardSize = useSelector((state: RootState) => state.game.boardSize);
    const borderSize = useSelector((state: RootState) => state.game.borderSize);
    const direction = useSelector((state: RootState) => state.control.direction);
    const window_width = useSelector((state: RootState) => state.control.window_width);

    const game_id = useSelector((state: RootState) => state.game.id);

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
            return <Board {...props} connection={connection} key={"renderBoard" + idx}/>;
        });

    //Check whether we refreshed mid game. Copy state
    useEffect(() => {
        if (game_id !== "") return;
        console.log("REFRESH");
        
        const stored_state: GameState = JSON.parse(sessionStorage.getItem("game")!);

        joinGame(connection, stored_state.id, stored_state.myPlayer);
        getTurn(connection);
        scanGame(connection, [0], 0);
    }, []);

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