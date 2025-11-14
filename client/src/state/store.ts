import { combineReducers, createStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer, type PersistConfig } from 'redux-persist'
import sessionStorage from 'redux-persist/lib/storage/session'
import type { PersistPartial } from 'redux-persist/es/persistReducer';

import type { ControlState, GameState } from './types.ts';
import gameReducer from './gameSlice.ts'
import controlReducer from './controlSlice.ts'
import hardSet from 'redux-persist/es/stateReconciler/hardSet';

export type RootState = {
  game: GameState;
  control: ControlState;
} & PersistPartial;

const rootPersistConfig = {
  key: 'root',
  storage: sessionStorage,
  whitelist: [],
  // stateReconciler: hardSet
};

const gamePersistConfig = {
  key: 'game',
  storage: sessionStorage,
  // whitelist: ['id'],
  // blacklist: ['globalBoard'],
  whitelist: [],
}

const controlPersistConfig = {
  key: 'control',
  storage: sessionStorage,
  // whitelist: ['current_depth'],
  whitelist: [],
}

const rootReducer = combineReducers({
  game: persistReducer(gamePersistConfig, gameReducer), 
  control: persistReducer(controlPersistConfig, controlReducer)
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export default function configureStore() {
  let store = createStore(persistedReducer)
  let persistor = persistStore(store)
  return { store, persistor }
}

// import { configureStore } from '@reduxjs/toolkit'

// import gameReducer from './gameSlice.ts'
// import controlReducer from './controlSlice.ts'
// import type { ControlState, GameState } from './types.ts';

// export type RootState = {
//   game: GameState;
//   control: ControlState;
// };

// const store = configureStore({
//   reducer: {
//     game: gameReducer,
//     control: controlReducer,
//   },
// })

// export default store