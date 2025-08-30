import { Provider } from "react-redux";
import {HashRouter, Routes, Route} from "react-router-dom";
import useWebSocket from 'react-use-websocket';

import store from "./state/store.ts";
import Game from "./components/game/Game.tsx";
import Home from "./components/home/Home.tsx"

function App() {
  // This can also be an async getter function. See notes below on Async Urls.
  const socketUrl = 'ws://localhost:8332';

  const {
    sendMessage,
    sendJsonMessage,
    lastMessage,
    lastJsonMessage,
    readyState,
    getWebSocket,
  } = useWebSocket(socketUrl, {
    protocols: "UN3T",

    onOpen: () => {
      console.log("Opened");
      sendMessage('L');
    },
    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: (closeEvent) => true,
  });
  return <Provider store={store}>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/game" element={<Game />}></Route>
      </Routes>
    </HashRouter>
  </Provider>;
};

export default App;