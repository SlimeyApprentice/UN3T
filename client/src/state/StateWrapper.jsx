import React from "react";
import {Provider} from "react-redux";
import store from "./store.jsx";

import App from "../App.jsx";

function StateWrapper() {
  return <Provider store={store}>
    <App />
  </Provider>;
};

export default StateWrapper;