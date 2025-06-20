import React from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import StrictMode from 'react';
import { Provider } from 'react-redux';
import store from './state/store.jsx';
import App from './App.jsx';

function AppWrapper() {
  
  return <Provider store={store}>
    <TransformWrapper
      initialScale={1}
      maxScale={2}
      minScale={1}
      centerOnInit={true}
    >
      <TransformComponent>
        <App />
      </TransformComponent>
    </TransformWrapper>
  </Provider>;
};

export default AppWrapper;