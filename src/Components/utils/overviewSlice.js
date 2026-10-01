import { createSlice } from "@reduxjs/toolkit";

// Platform-wide numbers from GET /sadmin/overview, shared by the Dashboard and the sidebar badges
const overviewSlice = createSlice({
  name: "overview",
  initialState: {
    data: null,
    loading: false,
    error: "",
    loadedAt: null,
  },
  reducers: {
    overviewLoading: (state) => {
      state.loading = true;
      state.error = "";
    },
    overviewLoaded: (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = "";
      state.loadedAt = Date.now();
    },
    overviewFailed: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { overviewLoading, overviewLoaded, overviewFailed } =
  overviewSlice.actions;

export default overviewSlice.reducer;
