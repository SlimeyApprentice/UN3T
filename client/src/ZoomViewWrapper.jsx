import React from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import App from './App.jsx';

function ZoomViewWrapper() {
  
  return <TransformWrapper
    initialScale={1}
    maxScale={2}
    minScale={1}
    centerOnInit={true}
  >
    <TransformComponent>
    <App />
    </TransformComponent>
  </TransformWrapper>;
};

export default ZoomViewWrapper;