import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { removeFromCart, updateQuantity } from "../redux/cartSlice.js";
import { formatCurrency } from "../utils/format.js";

const Cart = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const items = useSelector((state) => state.cart.items);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (user && user.role !== "buyer") {
    return (
      <section className="section">
        <div className="rounded-lg border border-stone-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-black">Buying is for buyer accounts</h1>
          <p className="mt-2 text-stone-600">Artisan and admin accounts can manage the marketplace, but they cannot purchase products.</p>
          <Link className="btn-primary mt-5" to={user.role === "artisan" ? "/artisan" : "/admin"}>
            Go to dashboard
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <h1 className="mb-6 text-3xl font-black">Cart</h1>
      {!items.length ? (
        <div className="rounded-lg border border-stone-200 bg-white p-8 text-center">
          <p className="text-stone-600">Your cart is empty.</p>
          <Link className="btn-primary mt-4" to="/products">Browse products</Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-3">
            {items.map((item) => (
              <div key={item.productId} className="grid gap-4 rounded-lg border border-stone-200 bg-white p-4 sm:grid-cols-[96px_1fr_auto] sm:items-center">
                <img src={item.image} alt={item.title} className="h-24 w-24 rounded-md object-cover" />
                <div>
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="text-sm text-stone-500">{formatCurrency(item.price)}</p>
                  <div className="mt-3 inline-flex items-center gap-2">
                    <button className="icon-btn icon-btn-secondary icon-btn-sm" onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }))} title="Decrease quantity">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button className="icon-btn icon-btn-secondary icon-btn-sm" onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))} title="Increase quantity">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <button className="icon-btn icon-btn-secondary" onClick={() => dispatch(removeFromCart(item.productId))} title="Remove from cart">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <aside className="h-fit rounded-lg border border-stone-200 bg-white p-5">
            <div className="flex justify-between text-sm text-stone-600">
              <span>Subtotal</span>
              <strong className="text-ink">{formatCurrency(total)}</strong>
            </div>
            <p className="mt-3 text-sm text-stone-500">Shipping and taxes are finalized during checkout.</p>
            <Link className="btn-primary mt-5 w-full" to="/checkout">Checkout</Link>
          </aside>
        </div>
      )}
    </section>
  );
};

export default Cart;
