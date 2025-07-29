<<<<<<< Updated upstream
import React from "react";
import { Provider } from "react-redux";
import store from "./state/store.jsx";
=======
import React, { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HashRouter, Routes, Route } from "react-router-dom";

import TcpSocket from 'react-native-tcp-socket';

import { setUrl } from "./state/socketSlice.jsx";
>>>>>>> Stashed changes
import Game from "./game/Game.jsx";
import Home from "./Home.jsx"

import {HashRouter, Routes, Route} from "react-router";

function App() {
<<<<<<< Updated upstream
  return <Provider store={store}>
    <HashRouter>
=======
  const dispatch = useDispatch();
  dispatch(setUrl("wss://localhost:8332"));
  // dispatch(setUrl("wss://echo.websocket.org"));

  const socketUrl = useSelector((state) => state.socket.url);

  // Create a TCP client
  const client = net.createConnection({ port: 8332 }, () => {
    console.log('Connected to server');
    
    // Send a message to the server
    client.write('Hello from client!');
  });

  // Set encoding
  client.setEncoding('utf8');

  // Handle data from server
  client.on('data', (data) => {
    console.log(`Received from server: ${data}`);
    
    // Send another message
    client.write('More data from client');
  });

  socket.emit('chat message', 'Hello, World!');

  return <HashRouter>
>>>>>>> Stashed changes
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/game" element={<Game />}></Route>
      </Routes>
    </HashRouter>
  </Provider>;
};

export default App;