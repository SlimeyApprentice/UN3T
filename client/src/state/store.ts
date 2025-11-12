import { combineReducers, createStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import { getPersistConfig } from 'redux-deep-persist';
import sessionStorage from 'redux-persist/lib/storage/session'

import gameReducer, { initGlobalBoard, resetGame } from './gameSlice.ts'
import controlReducer, { resetControl, setControlDepth } from './controlSlice.ts'
import { useDispatch, useSelector } from 'react-redux';
import type { ControlState, GameState } from './types.ts';
import type { PersistPartial } from 'redux-persist/es/persistReducer';

const rootReducer = combineReducers({
  game: gameReducer, 
  control: controlReducer
});
const persistConfig = getPersistConfig({
  key: 'root',
  storage: sessionStorage,
  // whitelist: ["game", "control"],
  whitelist: [],
  rootReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer);

export default function configureStore() {
  let store = createStore(persistedReducer)
  let persistor = persistStore(store)
  return { store, persistor }
}
export type RootState = {
  game: GameState;
  control: ControlState;
} & PersistPartial


// State changes across multiple reducers
export function stateNewGame() {
  const dispatch = useDispatch();

  const maxDepth = useSelector((state: RootState) => state.game.maxDepth)

  dispatch(initGlobalBoard());
  dispatch(setControlDepth(maxDepth));
} 
export function stateReset() {
  const dispatch = useDispatch();
  
  dispatch(resetGame());
  dispatch(resetControl());
}

// import { configureStore } from '@reduxjs/toolkit'
// import gameReducer from './gameSlice.ts'
// import controlReducer from './controlSlice.ts'

// const store = configureStore({
//   reducer: {
//     game: gameReducer,
//     control: controlReducer,
//   },
// })

// export default store