import { TransformWrapper } from "react-zoom-pan-pinch";
import { useSelector } from "react-redux";

import { getTurn, joinGame, MessageSuccess, scanGame, useProcessServer, type Connection } from "../../serverInterface";
import type { RootState } from "../../state/store";
import useProcessInput from "./controls";
import Board from "./Board";
import Renderer from "./Renderer";
import './grid_board.css';
import { useEffect } from "react";
import type { GameState, QueryParameters } from "../../state/types";
import { useSearchParams } from "react-router-dom";
import { ReadyState } from "react-use-websocket";
import { setControlDepth } from "../../state/controlSlice";

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
    // TODO: No longer change board size or border size?
    const boardSize = useSelector((state: RootState) => state.game.boardSize);
    const borderSize = useSelector((state: RootState) => state.game.borderSize);
    const direction = useSelector((state: RootState) => state.control.direction);
    const windowWidth = useSelector((state: RootState) => state.control.window_width);

    const gameId = useSelector((state: RootState) => state.game.id);
    const myPlayer = useSelector((state: RootState) => state.game.myPlayer);
    const maxDepth = parseInt(useSelector((state: RootState) => state.game.maxDepth));

    const cssVars = {
        "display": "flex",
        "--board-size": boardSize + "px",
        "--border-size": borderSize + "px",
        "width": windowWidth,
        "flex-direction": direction,
    };

    const [searchParams, setSearchParams] = useSearchParams();
    const storedId = searchParams.get("id");
    const storedPlayer = searchParams.get("player");

    // Store the bare minimum in url such that we can fetch state from server
    useEffect(() => {
        if (storedId && storedPlayer) {
            joinGame(connection, storedId, storedPlayer);
            getTurn(connection);
            scanGame(connection, [], maxDepth);
        } else {
            const params: QueryParameters = {
                id: gameId,
                player: myPlayer,
            };
            setSearchParams(params);
            console.log("AHGSFDYAGSFDHAGSFDHAGSFDHGDSF")
        }
    }, [gameId, myPlayer]);

    //Convert props in state into components
    const renderBoards = 
        useSelector((state: RootState) => state.control.renderBoards)
        .map((props, idx) =>  {
            return <Board {...props} connection={connection} key={"renderBoard" + idx}/>;
        });

    //No board
    if (gameId === MessageSuccess.Failure) return <p>Could not join game, sorry ;(</p>
    if (connection.readyState !== ReadyState.OPEN) return <p>Not connected to server</p>

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