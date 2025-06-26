import React, { useRef } from "react";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { Provider, useSelector } from "react-redux";
import store from "./state/store.jsx";
import App from "./Game.jsx";

function App() {
  return <Provider store={store}>
    <TransformWrapper
      initialScale={1}
      // maxScale={2}
      // minScale={1}
      disablePadding={true}
      centerOnInit={true}
      doubleClick={{disabled: true}}
    >
      <TransformComponent>
        <App />
      </TransformComponent>
    </TransformWrapper>
  </Provider>;
};

export default AppWrapper;