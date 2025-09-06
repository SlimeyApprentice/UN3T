import { Link } from "react-router-dom";

import { joinGame, newGame, type Connection } from "../../serverInterface";

import background from "../../assets/home_background.png";
import './home.css';
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import { useState, type ChangeEvent } from "react";
import { initGlobalBoard, setGameDepth, setGameID } from "../../state/gameSlice";
import { setControlDepth } from "../../state/controlSlice";

type HomeProps = {
    connection: Connection,
}
function Home({ connection }: HomeProps) {
  const dispatch = useDispatch();
  const maxDepth = useSelector((state: RootState) => state.game.maxDepth)
  const gameId = useSelector((state: RootState) => state.game.id)

  const handleNewGame = () => {
    if (!maxDepth) throw new Error("maxDepth empty when trying to make new game");

    dispatch(initGlobalBoard());
    newGame(connection, parseInt(maxDepth));
  }
  const handleJoinGame = () => {
    joinGame(connection, gameId);
    dispatch(setGameID(gameId));
  }

  const handleDepthInput = (event: ChangeEvent<HTMLInputElement>) => {
    let newMaxDepth: string = event.currentTarget.value;

    dispatch(setGameDepth(newMaxDepth));
    dispatch(setControlDepth(newMaxDepth));
  }

  const handleIdInput = (event: ChangeEvent<HTMLInputElement>) => {
    let id = event.currentTarget.value;
    dispatch(setGameID(id));
  }

  return <>
  <div className="home" style={{backgroundImage: `url(${background})`}}>
    <div className="background-cover"></div>
    <form className="menu-row">
      <Link to={"/game"} onClick={handleNewGame} className="menu-button spiiin">
        <span style={{"--i":"1"}}>N</span>
        <span style={{"--i":"2"}}>E</span>
        <span style={{"--i":"3"}}>W</span>
        <span>&nbsp;</span>
        <span style={{"--i":"4"}}>G</span>
        <span style={{"--i":"5"}}>A</span>
        <span style={{"--i":"6"}}>M</span>
        <span style={{"--i":"7"}}>E</span>
      </Link>
      <label htmlFor="set_depth">Depth:</label>
      <input id="set_depth" value={maxDepth} type="number" min={0} onChange={handleDepthInput}></input>
    </form>
    <form className="menu-row">
      <Link to={"/game"} onClick={handleJoinGame} className="menu-button spiiin">
        <span style={{"--i":"8"}}>J</span>
        <span style={{"--i":"9"}}>O</span>
        <span style={{"--i":"10"}}>I</span>
        <span style={{"--i":"11"}}>N</span>
        <span>&nbsp;</span>
        <span style={{"--i":"12"}}>G</span>
        <span style={{"--i":"13"}}>A</span>
        <span style={{"--i":"14"}}>M</span>
        <span style={{"--i":"15"}}>E</span>
      </Link>
      <label htmlFor="set_ID">ID:</label>
      <input id="set_ID" value={gameId} type="text" min={0} onChange={handleIdInput}></input>
    </form>
  </div></>;
};

export default Home;