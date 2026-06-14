import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import api from "../api/client.js";
import Spinner from "../components/Spinner.jsx";
import { formatCurrency, orderStatusClass } from "../utils/format.js";

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api
      .get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, [id]);

  const cancel = async () => {
    try {
      const { data } = await api.put(`/orders/${id}/cancel`);
      setOrder(data);
      toast.success("Order cancelled");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not cancel order");
    }
  };

  if (loading) return <Spinner />;
  if (!order) return <p className="section">Order not found.</p>;

  return (
    <section className="section">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-stone-500">Order {order._id}</p>
          <h1 className="text-3xl font-black">{formatCurrency(order.totalAmount)}</h1>
        </div>
        <span className={`rounded-md px-3 py-1 text-sm font-semibold ${orderStatusClass(order.status)}`}>{order.status}</span>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="grid gap-3">
          {order.items.map((item) => (
            <div key={item.productId?._id || item.productId} className="flex gap-4 rounded-lg border border-stone-200 bg-white p-4">
              <img src={item.image || item.productId?.images?.[0]?.url} alt={item.title} className="h-20 w-20 rounded-md object-cover" />
              <div>
                <h2 className="font-semibold">{item.title}</h2>
                <p className="text-sm text-stone-500">Qty {item.quantity} · {formatCurrency(item.price)}</p>
                <p className="text-sm text-stone-500">Artisan: {item.artisanId?.shop?.name || item.artisanId?.name}</p>
              </div>
            </div>
          ))}
        </div>
        <aside className="h-fit rounded-lg border border-stone-200 bg-white p-5">
          <h2 className="font-black">Delivery</h2>
          <p className="mt-2 text-sm text-stone-600">{order.address?.line1}, {order.address?.city}, {order.address?.country}</p>
          <h2 className="mt-5 font-black">Payment</h2>
          <p className="mt-2 text-sm text-stone-600">{order.paymentStatus} via {order.paymentProvider}</p>
          {order.status === "Placed" && <button className="btn-secondary mt-3 w-full" onClick={cancel}>Cancel order</button>}
        </aside>
      </div>
    </section>
  );
};

export default OrderDetail;
