import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./api"

// Async thunk to register user
export const registerUser = createAsyncThunk(
  "user/registerUser",
  async ({ data, token }, { rejectWithValue }) => {

    try {
      const response = await api.post("/v1/private/register", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log(response.data);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "user/fetchUserProfile",
  async ({ uid, token }, { rejectWithValue }) => {
    // console.log("HELLLOOOOOOOOOOOOOOOOOOOOOO",api);
    console.log("UID ID >>>", uid)
    try {
      const response = await api.get(`/v1/private/profile`, {
        params: { uid },
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "xyz", //dev only
        },
      });
      console.log("Final URL:", response.config.url);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      if (error.config) {
        console.log("Final URL (error):", error.config.baseURL + error.config.url);
        console.log("With params:", error.config.params);
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    userInfo: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;
