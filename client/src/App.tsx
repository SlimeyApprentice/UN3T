import { Provider } from "react-redux";
import {HashRouter, Routes, Route} from "react-router-dom";

import store from "./state/store.ts";
import Game from "./components/game/Game.tsx";
import Home from "./components/home/Home.tsx"

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