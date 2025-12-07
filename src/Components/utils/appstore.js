import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import instituteReducer from "./instituteSlice";


const appStore = configureStore({
    reducer: {
        user: userReducer,
        institute: instituteReducer,
    }
});

export default appStore