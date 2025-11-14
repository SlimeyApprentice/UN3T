import {HashRouter, Routes, Route} from "react-router-dom";
import useWebSocket from "react-use-websocket";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react'

import type { Connection } from "./serverInterface.ts";
import Game from "./components/game/Game.tsx";
import Home from "./components/home/Home.tsx"
import getStore from "./state/store.ts";

function App() {
  const { 
    sendMessage, 
    sendJsonMessage,
    lastMessage, 
    lastJsonMessage, 
    readyState 
  } = useWebSocket("ws://localhost:8332", {
      protocols: "UN3T",
      //Will attempt to reconnect on all close events, such as server shutting down
      shouldReconnect: (_closeEvent) => true,
  });
  const connection: Connection = {
      sendMessage,
      sendJsonMessage,
      lastMessage,
      lastJsonMessage,
      readyState
  }

  const { store, persistor } = getStore();

  return <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home connection={connection}/>}></Route>
          <Route path="/game" element={<Game connection={connection}/>}></Route>
        </Routes>
      </HashRouter>
      </PersistGate>
  </Provider>;
};

export default App;