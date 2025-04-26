// src/redux/imageSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  imageData: {},
};

const imageSlice = createSlice({
  name: 'image',
  initialState,
  reducers: {
    setImageData(state, action) {
      state.imageData = action.payload;
    },
  },
});

export const { setImageData } = imageSlice.actions;
export default imageSlice.reducer;
