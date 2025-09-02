import { Link } from "react-router-dom";

import { joinGame, newGame, type Connection } from "../../serverInterface";
import { MAX_DEPTH } from "../../state/controlSlice";

import background from "../../assets/home_background.png";
import './home.css';

type HomeProps = {
    connection: Connection,
}
function Home({ connection }: HomeProps) {
  const handleNewGame = async () => {
    newGame(connection, MAX_DEPTH);
  }
  const handleJoinGame = () => {
    const game_id = "0";
    joinGame(connection, game_id);
  }

  return <div className="home" style={{backgroundImage: `url(${background})`}}>
    <div className="background-cover"></div>
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
  </div>;
};

export default Home;