/**
 * API:
 *
 * N <int string: depth>                     creates a new game, returning the game id. fails if the client is already in a game
 * J <int string: game_id>                   joins a game, fails if the game doesn't exist
 * L                                         leaves the current game
 * T                                         returns the current game's current restriction and the current player as a JSON object
 * M <string: location>                      makes a move in the current game, fails if the client hasn't created or joined a game yet
 * S <string: location> <int string: depth>  scans the board at the specified location and depth steps down, and returns the contents found as a JSON object
 *
 * All strings are composed of the digits 0 through 9, (0 through 8 in the case of non-int strings), terminated by a semicolon (;). Commands are terminated by a newline (\n).
**/

import type { SendJsonMessage } from "react-use-websocket/dist/lib/types";
import type { ReadyState, SendMessage } from "react-use-websocket";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

import { initGlobalBoard, setGameDepth, receiveMove, setGameID, setPlayer, resetGame, receiveScan, receiveTurn } from "./state/gameSlice";
import { messageToGamePlayer, Player, type GameMove } from "./state/types";
import { resetControl, setControlDepth } from "./state/controlSlice";
import type { Dispatch } from "@reduxjs/toolkit";
import type { RootState } from "./state/store";

export type Connection = {
    sendMessage: SendMessage,
    sendJsonMessage: SendJsonMessage,
    lastMessage: MessageEvent<string> | null,
    lastJsonMessage: any,
    readyState: ReadyState
}

export function newGame(
    connection: Connection,
    depth: number
) {
    connection.sendMessage(`N${depth};\n`);
}

export function joinGame(
    connection: Connection,
    game_id: string,
    player: Player | string,
) {
    connection.sendMessage(`J${game_id};${player};\n`);
}

export function leaveGame(
    connection: Connection,
) {
    connection.sendMessage("L;\n");
}

export function getTurn(
    connection: Connection,
) {
    connection.sendMessage(`T;\n`);
}

export function makeMoveServer(
    connection: Connection,
    coordinates: number[],
) {
    const stringCoords = coordinates.join("");
    console.log("Making move: " + stringCoords);
    connection.sendMessage(`M${stringCoords};\n`);
}

export function scanGame(
    connection: Connection,
    coordinates: number[],
    depth: number,
) {
    const stringCoords = coordinates.join("");
    console.log("Scanning at: " + stringCoords);
    connection.sendMessage(`S${stringCoords};${depth};\n`);
}


enum MessageSignature {
    NewGame = "N",
    JoinGame = "J",
    LeaveGame = "L",
    Turn = "T",
    Move = "M",
    Scan = "S"
}
export enum MessageSuccess {
    Success = "SUCCESS",
    Failure = "FAILURE"
}
export enum MessageValue {
    Empty = 0,
    Cross = 1,
    Circle = 2,
    NotYourTurn = -1,
    WrongDepth = -2,
    GameOver = -3,
    WrongBoard = -4,
}
export type MessageTurn = {
    depth: number,
    player: 1 | 2,
    you: 1 | 2
    restriction: string,
}
export type MessageScan = [MessageScan | number]

// Ideally should not need connection anymore. 
// Calling message as response to message is a bad idea 
function handleResponse(
    dispatch: Dispatch<any>, 
    gameId: string, 
    connection: Connection, 
    responses: string[]
) {
    if (responses.length === 0) return; // Base Step

    const activeResponse = responses[0];

    const signature: MessageSignature = activeResponse[0] as MessageSignature;
    const msg = activeResponse.slice(1, activeResponse.length);


    console.log("Received signature: " + signature);
    console.log("Received message: " + msg);

    switch (signature) {
        case MessageSignature.NewGame:
            if (msg == MessageSuccess.Failure) dispatch(setGameID(MessageSuccess.Failure));

            const game_id = msg.split(";")[0];
            // We reset in order to get rid of no longer wanted persisted state
            dispatch(resetGame());
            dispatch(resetControl());

            dispatch(setGameID(game_id));
            break;            
        case MessageSignature.JoinGame:
            if (msg == MessageSuccess.Failure && gameId !== "") {
                dispatch(setGameID(MessageSuccess.Failure));
            }

            // We reset in order to get rid of no longer wanted persisted state
            dispatch(resetGame());
            dispatch(resetControl());
            break;
        case MessageSignature.Turn:
            if (msg == MessageSuccess.Failure) return;

            try {
                const jsonMsg: MessageTurn = JSON.parse(msg);
                console.log(jsonMsg);

                dispatch(receiveTurn(jsonMsg));
                dispatch(setControlDepth(jsonMsg.depth.toString()))
            } catch (e) {
                console.log("Failed to parse Turn");
                console.log(e);
            }
            break;
        case MessageSignature.Move:
            if (msg == MessageSuccess.Failure) return;

            try {
                const move: MessageMove = JSON.parse(msg);
                console.log(move);
                dispatch(receiveMove(move));

            } catch (e) {
                console.log("Failed to parse Move");
                console.log(e);
            }
            break;
        case MessageSignature.Scan:
            if (msg == MessageSuccess.Failure) return;

            console.log("Scan response: " + activeResponse);
            try {
                const scan: MessageScan = JSON.parse(msg);
                dispatch(receiveScan(scan));

            } catch (e) {
                console.log("Failed to parse Scan");
                console.log(e);
            }
            break;
    }

    // Recursive step
    if (responses.length > 0) {
        responses.splice(0,1);
        handleResponse(dispatch, gameId, connection, responses);
    }
}

// Receieve server responses and modify global state
export function useProcessServer(connection: Connection) {
    const dispatch = useDispatch();
    const gameId = useSelector((state: RootState) => state.game.id);
    
    useEffect(() => {
        if (!connection.lastMessage) return;
        // We get empty message on refresh, ignore
        if (connection.lastMessage.data === "") return;
    
        const responses: string[] = connection.lastMessage.data
                .split('\n')
                .join('\u0000')
                .split('\u0000');
        console.log(responses);
        handleResponse(dispatch, gameId, connection, responses);

    }, [connection.lastMessage])
}