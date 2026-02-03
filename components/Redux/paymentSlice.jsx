import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./api";

export const confirmPayment = createAsyncThunk(
  "payment/confirmPayment",
  async ({ token, razorpayPaymentId, razorpayOrderId, razorpaySignature }, thunkAPI) => {
    try {
      const response = await api.post(
        "/v1/private/hotel/confirm-payment",
        {
          razorpayPaymentId,
          razorpayOrderId,
          razorpaySignature,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          validateStatus: (status) => status === 200 || status === 409,
        }
      );
      console.log(response)
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);
export const carPackageConfirmPayment = createAsyncThunk(
  "payment/confirmCarPayment",
  async ({ token, razorpayPaymentId, razorpayOrderId, razorpaySignature }, thunkAPI) => {
    try {
      const response = await api.post(
        "/v1/private/car-package-booking/confirm-payment",
        {
          razorpayPaymentId,
          razorpayOrderId,
          razorpaySignature,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          validateStatus: (status) => status === 200 || status === 409,
        }
      );
      console.log(response)
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);


const initialState = {
  paymentStatus: null,
  paymentLoading: false,
  paymentError: null,

  //carpackages
  carpackagepaymentStatus: null,
  carpackagepaymentLoading: false,
  carpackagepaymentError: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    resetPaymentState: (state) => {
      state.paymentStatus = null;
      state.paymentLoading = false;
      state.paymentError = null;
    },
    carPaymentSlice:(state)=>{
      state.carpackagepaymentStatus = null;
      state.carpackagepaymentLoading = false;
      state.carpackagepaymentError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(confirmPayment.pending, (state) => {
        state.paymentLoading = true;
        state.paymentError = null;
        state.paymentStatus = null;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.paymentLoading = false;
        state.paymentStatus = action.payload;
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.paymentLoading = false;
        state.paymentError = action.payload;
      })
      .addCase(carPackageConfirmPayment.pending, (state) => {
        state.carpackagepaymentLoading = true;
        state.carpackagepaymentError = null;
        state.carpackagepaymentStatus = null;
      })
      .addCase(carPackageConfirmPayment.fulfilled, (state, action) => {
        state.carpackagepaymentLoading = false;
        state.carpackagepaymentStatus = action.payload;
      })
      .addCase(carPackageConfirmPayment.rejected, (state, action) => {
        state.carpackagepaymentLoading = false;
        state.carpackagepaymentError = action.payload;
      });
  },
});

export const { resetPaymentState, carPaymentSlice } = paymentSlice.actions;
export default paymentSlice.reducer;