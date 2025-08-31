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

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { ReadyState, SendMessage } from "react-use-websocket";
import type { SendJsonMessage } from "react-use-websocket/dist/lib/types";
import { setGameID } from "./state/gameSlice";
import useWebSocket from "react-use-websocket";

export type Connection = {
    sendMessage: SendMessage,
    sendJsonMessage: SendJsonMessage,
    lastMessage: MessageEvent<string> | null,
    lastJsonMessage: any,
    readyState: ReadyState
}

// export async function newGame(
//     connection: Connection,
//     depth: number
// ): Promise<string> {
//     console.log(connection.lastMessage);
//     return new Promise((resolve, reject) => {
//         connection.sendMessage(`N${depth};\n`);
//         while (!connection.lastMessage?.data) {
//             // console.log(connection.lastMessage);
//             // pass
//         }

//         const game_id = connection.lastMessage!.data.split(";")[0];
//         resolve(game_id);
//     })
// }

export function newGame(
    connection: Connection,
    depth: number
) {
    // useEffect(() => {
    //     const dispatch = useDispatch();
    //     dispatch(setGameID(connection.lastMessage!.data.split(";")[0]));
    // }, [connection.lastMessage]);

    connection.sendMessage(`N${depth};\n`);
}

export function joinGame(
    connection: Connection,
    game_id: string
): string {
    connection.sendMessage(`J${game_id};\n`);
    while (!connection.lastMessage) {
        // pass
    }

    const success = connection.lastMessage!.data.split(";")[0];
    return connection.lastMessage!.data;
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

export function makeMove(
    connection: Connection,
    coordinates: number[],
) {
    
}

export function scanGame(
    connection: Connection,
    coordinates: number[],
    depth: number,
) {
    
}


enum MessageType {
    NewGame = "N",
    JoinGame = "J",
    LeaveGame = "L",
    Turn = "T",
    Move = "M",
    Scan = "S"
}
// Receieve server responses and modify global state
export function useProcessServer(connection: Connection) {
    const dispatch = useDispatch();
    
    useEffect(() => {
        if (!connection.lastMessage) return;
        const msgType: MessageType = connection.lastMessage!.data[0] as MessageType;
        const msg = connection.lastMessage!.data.slice(1);

        switch (msgType) {
            case MessageType.NewGame:
                const game_id = msg.split(";")[0];
                dispatch(setGameID(game_id));
                break;            
        }


    }, [connection.lastMessage])

    useEffect(() => {
        if (!connection.lastMessage) return;
        const msg = connection.lastJsonMessage!.data;
        console.log(msg);

        // switch (msgType) {
        //     case MessageType.NewGame:
        //         const game_id = msg.split(";")[0];
        //         dispatch(setGameID(game_id));
        //         break;            
        // }
    }, [connection.lastJsonMessage])
}