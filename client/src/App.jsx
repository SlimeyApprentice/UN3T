import React from "react";
import { Provider } from "react-redux";
import store from "./state/store.jsx";
import Game from "./game/Game.jsx";

function App() {
  return <Provider store={store}>
    <Game/>
  </Provider>;
};

export default App;