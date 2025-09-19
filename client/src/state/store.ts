import { combineReducers, configureStore, createStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import sessionStorage from 'redux-persist/lib/storage/session'

import gameReducer from './gameSlice.ts'
import controlReducer from './controlSlice.ts'

const persistConfig = {
  key: 'root',
  storage: sessionStorage,
};

const persistedReducer = persistReducer(persistConfig, combineReducers({
  game: gameReducer, 
  control: controlReducer
}));

export default function configureStore() {
  let store = createStore(persistedReducer)
  let persistor = persistStore(store)
  return { store, persistor }
}