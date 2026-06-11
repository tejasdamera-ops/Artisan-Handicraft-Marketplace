import { createSlice } from "@reduxjs/toolkit";

const loadCart = () => JSON.parse(localStorage.getItem("artisan_cart") || "[]");
const persist = (items) => localStorage.setItem("artisan_cart", JSON.stringify(items));

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: loadCart()
  },
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const existing = state.items.find((item) => item.productId === product._id);
      if (existing) existing.quantity += 1;
      else {
        state.items.push({
          productId: product._id,
          title: product.title,
          price: product.price,
          image: product.images?.[0]?.url,
          stock: product.stock,
          quantity: 1
        });
      }
      persist(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.productId !== action.payload);
      persist(state.items);
    },
    updateQuantity: (state, action) => {
      const item = state.items.find((cartItem) => cartItem.productId === action.payload.productId);
      if (item) item.quantity = Math.max(1, Math.min(action.payload.quantity, item.stock || 99));
      persist(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      persist(state.items);
    }
  }
});

export const { addToCart, clearCart, removeFromCart, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer;
