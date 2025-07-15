import { createSlice } from '@reduxjs/toolkit'

export const socketSlice = createSlice({
  name: 'Socket State',
  initialState: {
    url: null,
  },
  reducers: {
    setUrl: (state, action) => {
        const url = action.payload;
        state.url = url;
    }
  },
})

// Action creators are generated for each case reducer function
export const { setUrl } = socketSlice.actions

export default socketSlice.reducer