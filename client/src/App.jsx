import React from "react";
import { Provider } from "react-redux";
import store from "./state/store.jsx";
import Game from "./game/Game.jsx";
import Home from "./Home.jsx"

import {BrowserRouter, Routes, Route} from "react-router";

function App() {
  return <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/game" element={<Game />}></Route>
      </Routes>
    </BrowserRouter>
  </Provider>;
};

export default App;