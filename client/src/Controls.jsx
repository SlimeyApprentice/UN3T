import React, { useRef } from "react";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { Provider, useSelector } from "react-redux";
import store from "./state/store.jsx";
import App from "./Logic.jsx";

function AppWrapper() {
  const transitionStates = useSelector((state) => state.control.transitionStates);
  const { instance, resetTransform, setTransform } = useControls();
  //Move the window to the correct place
  useEffect(() => {
    console.log("Update?");

    if (transitionStates["top"] == "spawned") {
      console.log("Transitioning");
      const element = document.querySelector("#middle");
      console.log(element);

      setTransform(0, -element.offsetWidth, 1, 100.0, "easeInCubic"); //Instantly go back to middle
      // resetTransform(500);
    }

  }, [transitionStates])

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