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
import { useDispatch } from "react-redux";
import { useEffect } from "react";

import { setGameID } from "./state/gameSlice";

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
    game_id: string
) {
    connection.sendMessage(`J${game_id};\n`);

    const dispatch = useDispatch();
    dispatch(setGameID(game_id));
}

export function leaveGame(
    connection: Connection,
) {
    connection.sendMessage("L;\n");
}

export function getTurnRestriction(
    connection: Connection,
) {
    connection.sendMessage(`T;\n`);
}

export function makeMoveServer(
    connection: Connection,
    coordinates: number[],
) {
    const stringCoords = coordinates.join("");
    connection.sendMessage(`M${stringCoords};\n`);
}

export function scanGame(
    connection: Connection,
    coordinates: number[],
    depth: number,
) {
    
}


enum MessageSignature {
    NewGame = "N",
    JoinGame = "J",
    LeaveGame = "L",
    Turn = "T",
    Move = "M",
    Scan = "S"
}
enum MessageSuccess {
    Success = "SUCCESS",
    Failure = "FAILURE"
}
enum MessagePlayer {
    Cross = 1,
    Circle = 2
}
// Receieve server responses and modify global state
export function useProcessServer(connection: Connection) {
    const dispatch = useDispatch();
    
    useEffect(() => {
        if (!connection.lastMessage) return;
        const signature: MessageSignature = connection.lastMessage!.data[0] as MessageSignature;

        const msgLen = connection.lastMessage!.data.length;
        //Some wrong bit at the end of message
        let msg = connection.lastMessage!.data.slice(1, msgLen-1);

        console.log("Received signature: " + signature);
        console.log("Received message: " + msg);

        if (msg == MessageSuccess.Failure) return;

        switch (signature) {
            case MessageSignature.NewGame:
                const game_id = msg.split(";")[0];
                dispatch(setGameID(game_id));
                break;            
            case MessageSignature.JoinGame:
                if (msg == MessageSuccess.Failure) dispatch(setGameID(undefined));
                break;
            case MessageSignature.Turn:
                try {
                    const jsonMsg = JSON.parse(msg);
                    console.log(jsonMsg);
                } catch (e) {
                    console.log("Failed to parse Turn");
                    console.log(e);
                }
                break;
            case MessageSignature.Move:
                try {
                    const jsonMsg = JSON.parse(msg);
                    console.log(jsonMsg);
                } catch (e) {
                    console.log("Failed to parse Move");
                    console.log(e);
                }
                break;
        }


    }, [connection.lastMessage])
}