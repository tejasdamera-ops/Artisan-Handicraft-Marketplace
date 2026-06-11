import { createSlice } from "@reduxjs/toolkit";

const loadWishlist = () => JSON.parse(localStorage.getItem("artisan_wishlist") || "[]");
const persist = (items) => localStorage.setItem("artisan_wishlist", JSON.stringify(items));

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: loadWishlist()
  },
  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload;
      const exists = state.items.some((item) => item._id === product._id);
      state.items = exists ? state.items.filter((item) => item._id !== product._id) : [...state.items, product];
      persist(state.items);
    },
    clearWishlist: (state) => {
      state.items = [];
      persist(state.items);
    }
  }
});

export const { clearWishlist, toggleWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
