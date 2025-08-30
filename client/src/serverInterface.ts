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

export function newGame(
    sendMessage: (message: string, keep: boolean) => void,
    depth: number
) {

}

export function joinGame(
    sendMessage: (message: string, keep: boolean) => void,
    game_id: string
) {
    
}

export function leaveGame(
    sendMessage: (message: string, keep: boolean) => void,
) {
    sendMessage("L", true);
}

export function getRestriction(
    sendMessage: (message: string, keep: boolean) => void,
) {
    
}

export function makeMove(
    sendMessage: (message: string, keep: boolean) => void,
    coordinates: number[],
) {
    
}

export function lookUpCoordinates(
    sendMessage: (message: string, keep: boolean) => void,
    coordinates: number[],
    depth: number,
) {
    
}