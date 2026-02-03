import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import queryReducer from "./querySlice";
import profileReducer from './profileSlice'
import hotelReducer from './hotelSlice'
import paymentReducer from './paymentSlice'
import carPackageReducer from './carPackageSlice'
import tourPackageSlice from './tourPackageSlice'
import pickupSlice from './pickupSlice'

const store = configureStore({
  reducer: {
    user: userReducer,
    query: queryReducer,
    profile:profileReducer,
    hotel:hotelReducer,
    payment:paymentReducer,
    car:carPackageReducer,
    tour:tourPackageSlice,
    pickup:pickupSlice
  },
});

export default store;
