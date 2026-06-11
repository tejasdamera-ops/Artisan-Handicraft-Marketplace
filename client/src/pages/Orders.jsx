import { Eye, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api/client.js";
import Spinner from "../components/Spinner.jsx";
import { formatCurrency, orderStatusClass } from "../utils/format.js";

const getOrderArtisans = (order) => {
  const artisans = new Map();

  order.items?.forEach((item) => {
    const artisan = item.artisanId;
    const id = artisan?._id || artisan;
    if (id && !artisans.has(id)) {
      artisans.set(id, {
        id,
        name: artisan?.shop?.name || artisan?.name || "Artisan"
      });
    }
  });

  return [...artisans.values()];
};

const Orders = () => {
  const user = useSelector((state) => state.auth.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders/my")
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <section className="section">
      <h1 className="mb-6 text-3xl font-black">Order history</h1>
      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        <div className="grid min-w-[860px] grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr_auto] gap-4 border-b border-stone-200 p-4 text-sm font-semibold text-stone-500">
          <span>Order</span>
          <span>Total</span>
          <span>Status</span>
          <span>Payment</span>
          <span>Chat</span>
          <span />
        </div>
        {orders.map((order) => {
          const artisans = getOrderArtisans(order);

          return (
            <div key={order._id} className="grid min-w-[860px] grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr_auto] gap-4 border-b border-stone-100 p-4 text-sm last:border-0">
              <span className="font-semibold">{order._id}</span>
              <span>{formatCurrency(order.totalAmount)}</span>
              <span><span className={`rounded-md px-2 py-1 ${orderStatusClass(order.status)}`}>{order.status}</span></span>
              <span>{order.paymentStatus}</span>
              <span className="flex flex-wrap gap-2">
                {user?.role === "buyer" && artisans.length ? (
                  artisans.map((artisan) => (
                    <Link key={artisan.id} className="btn-secondary px-3 py-1.5 text-xs" to={`/chat?user=${artisan.id}`}>
                      <MessageCircle className="h-3.5 w-3.5" />
                      {artisan.name}
                    </Link>
                  ))
                ) : (
                  <span className="text-stone-400">-</span>
                )}
              </span>
              <Link className="icon-btn icon-btn-secondary" to={`/orders/${order._id}`} title="View order">
                <Eye className="h-4 w-4" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Orders;
