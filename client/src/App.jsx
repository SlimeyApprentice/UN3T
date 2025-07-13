import React from "react";
import { Provider } from "react-redux";
import store from "./state/store.jsx";
import Game from "./game/Game.jsx";
import Home from "./Home.jsx"

import {HashRouter, Routes, Route} from "react-router";

function App() {
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