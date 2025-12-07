import { createSlice } from "@reduxjs/toolkit";

const instituteSlice = createSlice({
  name: "institute",
   initialState: {
    pending: [],
    verified: [],
    selected: null,
    counts: {
      pending: 0,
      verified: 0,
    },
  }, 
  reducers: {
    
    setPendingCount: (state, action) => {
      state.counts.pending = action.payload;
    },
    setVerifiedCount: (state, action) => {
      state.counts.verified = action.payload;
    },

    setPendingInstitutes: (state, action) => {
      state.pending = action.payload;
    },
    setVerifiedInstitutes: (state, action) => {
      state.verified = action.payload;
    },
    setSelectedInstitute: (state, action) => {
      state.selected = action.payload;
    },
    clearSelectedInstitute: (state) => {
      state.selected = null;
    },
  },
});

export const {
  setPendingInstitutes,
  setVerifiedInstitutes,
  setSelectedInstitute,
  clearSelectedInstitute,
  setPendingCount,
  setVerifiedCount,
} = instituteSlice.actions;

export default instituteSlice.reducer;
