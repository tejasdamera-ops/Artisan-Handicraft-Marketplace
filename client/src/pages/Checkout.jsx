import { CreditCard } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { clearCart } from "../redux/cartSlice.js";
import { formatCurrency } from "../utils/format.js";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth.user);
  const [paymentProvider, setPaymentProvider] = useState("razorpay");
  const [address, setAddress] = useState(user?.address || { country: "India" });
  const [loading, setLoading] = useState(false);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const update = (event) => setAddress((current) => ({ ...current, [event.target.name]: event.target.value }));

  const placeOrder = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data: order } = await api.post("/orders", {
        items: items.map(({ productId, quantity }) => ({ productId, quantity })),
        address,
        paymentProvider
      });
      await api.post("/payments/create-order", { orderId: order._id, provider: paymentProvider });
      toast.success("Order placed. Complete payment in your provider dashboard.");
      dispatch(clearCart());
      navigate(`/orders/${order._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not place order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section">
      <h1 className="mb-6 text-3xl font-black">Checkout</h1>
      <form className="grid gap-6 lg:grid-cols-[1fr_360px]" onSubmit={placeOrder}>
        <div className="grid gap-4 rounded-lg border border-stone-200 bg-white p-5">
          <h2 className="text-xl font-black">Delivery address</h2>
          {["line1", "line2", "city", "state", "postalCode", "country", "phone"].map((field) => (
            <input key={field} className="input" name={field} placeholder={field.replace(/([A-Z])/g, " $1")} value={address[field] || ""} onChange={update} required={["line1", "city", "country", "phone"].includes(field)} />
          ))}
          <h2 className="mt-3 text-xl font-black">Payment</h2>
          <select className="input" value={paymentProvider} onChange={(event) => setPaymentProvider(event.target.value)}>
            <option value="razorpay">Razorpay</option>
            <option value="stripe">Stripe</option>
          </select>
        </div>
        <aside className="h-fit rounded-lg border border-stone-200 bg-white p-5">
          <h2 className="text-xl font-black">Order summary</h2>
          <div className="mt-4 grid gap-3">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between gap-3 text-sm">
                <span>{item.title} x {item.quantity}</span>
                <strong>{formatCurrency(item.price * item.quantity)}</strong>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-between border-t border-stone-200 pt-4 font-black">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <button className="btn-primary mt-5 w-full" disabled={loading || !items.length}>
            <CreditCard className="h-4 w-4" />
            Place order
          </button>
        </aside>
      </form>
    </section>
  );
};

export default Checkout;
