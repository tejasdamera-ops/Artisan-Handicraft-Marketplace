import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/client.js";

export const fetchNotifications = createAsyncThunk("notifications/fetch", async () => {
  const { data } = await api.get("/notifications");
  return data;
});

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
    unreadCount: 0
  },
  reducers: {
    pushNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.notifications = action.payload.notifications;
      state.unreadCount = action.payload.unreadCount;
    });
  }
});

export const { pushNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
