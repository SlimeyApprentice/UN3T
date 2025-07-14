import React from "react";
import { Link } from "react-router-dom";

import background from "./assets/home_background.png";
import './home.css';

function Home() {
  return <div className="home" style={{backgroundImage: `url(${background})`}}>
    <div className="background-cover"></div>
    <Link to={"/game"} className="menu-button spiiin">
      <span style={{"--i":"1"}}>N</span>
      <span style={{"--i":"2"}}>E</span>
      <span style={{"--i":"3"}}>W</span>
      <span>&nbsp;</span>
      <span style={{"--i":"4"}}>G</span>
      <span style={{"--i":"5"}}>A</span>
      <span style={{"--i":"6"}}>M</span>
      <span style={{"--i":"7"}}>E</span>
    </Link>
    <Link className="menu-button spiiin">
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