import { configureStore } from '@reduxjs/toolkit'
import gameReducer from './gameSlice'
import controlReducer from './controlSlice'
import socketReducer from './socketSlice'

export default configureStore({
  reducer: {
    game: gameReducer,
    control: controlReducer,
    socket: socketReducer,
  },
})