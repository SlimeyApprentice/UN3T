import React, { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useSelector, useDispatch } from 'react-redux';
import { HashRouter, Routes, Route } from "react-router-dom";
import { setUrl } from "./state/socketSlice.jsx";

import Game from "./game/Game.jsx";
import Home from "./Home.jsx"

function App() {
  const dispatch = useDispatch();
  dispatch(setUrl("wss://localhost:8332"));
  // dispatch(setUrl("wss://echo.websocket.org"));

  const socketUrl = useSelector((state) => state.socket.url);


  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);
  //echo
  useEffect(() => {
    console.log("LAST MESSAGE: ");
    console.log(lastMessage);
  }, [lastMessage]);
  
  useEffect(() => {
    const connectionStatus = {
      [ReadyState.CONNECTING]: 'Connecting',
      [ReadyState.OPEN]: 'Open',
      [ReadyState.CLOSING]: 'Closing',
      [ReadyState.CLOSED]: 'Closed',
      [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];
  

    console.log("Ready State: " + connectionStatus);

    sendMessage("L");
  }, [readyState])

  return <HashRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/game" element={<Game />}></Route>
      </Routes>
    </HashRouter>;
};

export default App;