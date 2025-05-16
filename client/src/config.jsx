class Config {
    depth; 
    xIsNext; 
    setXIsNext; 
    externalSetIsWon;
    initState;

    //Default values constructor
    constructor() {
          const [xIsNext, setXIsNext] = useState(true);
          const [isWon, setIsWon] = useState(null);
          const depth = 2;
          const wrapper = (winningPlayer) => {
            setIsWon(winningPlayer);
            console.log(winningPlayer);
          }
          const [current_depth, setDepth] = useState(depth-1);
          const [current_index, setIdx] = useState(4);
          const [nearbyBoards, showBoards] = useState({
            "top": false,
            "left": false,
            "middle": true,
            "right": false,
            "bottom": false,
          });
          let [state, setState] = useState(initBoard(depth));
    }
}