import { configureStore } from '@reduxjs/toolkit'
import gameReducer from './gameSlice'
import controlReducer from './controlSlice'

export default configureStore({
  reducer: {
    game: gameReducer,
    control: controlReducer,
  },
})