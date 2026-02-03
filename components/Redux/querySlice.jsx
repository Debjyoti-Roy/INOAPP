import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./api"
export const sendPrivateQuery = createAsyncThunk(
  "query/sendPrivateQuery",
  async ({ token, subject, message }, { rejectWithValue }) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const body = {
        subject,
        message,
      };
      const response = await api.post("/v1/private/create-query", body, { headers });
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ✅ New public query thunk
export const sendPublicQuery = createAsyncThunk(
  "query/sendPublicQuery",
  async ({ subject, message, name, contact }, { rejectWithValue }) => {
    try {
      const body = {
        subject,
        message,
        name,
        contact,
      };
      console.log("NOT LOGGED IN")

      const response = await api.post("/v1/public/create-query", body, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ✅ Slice (can share one slice, or split if you want)
const querySlice = createSlice({
  name: "query",
  initialState: {
    loading: false,
    data: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Private query
      .addCase(sendPrivateQuery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendPrivateQuery.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(sendPrivateQuery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Public query
      .addCase(sendPublicQuery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendPublicQuery.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(sendPublicQuery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default querySlice.reducer;