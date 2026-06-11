import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/client.js";
import { resetSocket } from "../api/socket.js";

const persisted = JSON.parse(localStorage.getItem("artisan_auth") || "null");

export const loginUser = createAsyncThunk("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/login", payload);
    localStorage.setItem("artisan_auth", JSON.stringify(data));
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Login failed.");
  }
});

export const registerUser = createAsyncThunk("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("artisan_auth", JSON.stringify(data));
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Registration failed.");
  }
});

export const fetchMe = createAsyncThunk("auth/me", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/auth/me");
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Could not load profile.");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: persisted?.user || null,
    accessToken: persisted?.accessToken || null,
    refreshToken: persisted?.refreshToken || null,
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem("artisan_auth");
      resetSocket();
    },
    setUser: (state, action) => {
      state.user = action.payload;
      const persistedAuth = JSON.parse(localStorage.getItem("artisan_auth") || "{}");
      localStorage.setItem("artisan_auth", JSON.stringify({ ...persistedAuth, user: action.payload }));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  }
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
