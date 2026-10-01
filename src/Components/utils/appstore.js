import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import instituteReducer from "./instituteSlice";
import overviewReducer from "./overviewSlice";


const appStore = configureStore({
    reducer: {
        user: userReducer,
        institute: instituteReducer,
        overview: overviewReducer,
    }
});

export default appStore