import { configureStore } from '@reduxjs/toolkit'
import gameReducer from './gameSlice.ts'
import controlReducer from './controlSlice.ts'

const store = configureStore({
  reducer: {
    game: gameReducer,
    control: controlReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>

export default store