import { configureStore } from '@reduxjs/toolkit'

import gameReducer from './gameSlice.ts'
import controlReducer from './controlSlice.ts'
import type { ControlState, GameState } from './types.ts';

export type RootState = {
  game: GameState;
  control: ControlState;
};

const store = configureStore({
  reducer: {
    game: gameReducer,
    control: controlReducer,
  },
})

export default store