import { CheckCircle, ShieldAlert, UsersRound, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client.js";
import Spinner from "../components/Spinner.jsx";
import { formatCurrency, orderStatusClass } from "../utils/format.js";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [statsRes, usersRes, ordersRes, productsRes] = await Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/users"),
      api.get("/admin/orders"),
      api.get("/products", { params: { includePending: true } })
    ]);
    setStats(statsRes.data);
    setUsers(usersRes.data);
    setOrders(ordersRes.data);
    setProducts(productsRes.data.filter((product) => product.approvalStatus === "pending" || !product.isApproved));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id, approved) => {
    await api.put(`/products/${id}/approve`, { approved });
    setProducts((current) => current.filter((product) => product._id !== id));
    setStats((current) => current ? { ...current, pendingProducts: Math.max((current.pendingProducts || 1) - 1, 0) } : current);
    toast.success(approved ? "Product approved" : "Product rejected");
    load();
  };

  if (loading) return <Spinner />;

  return (
    <section className="section">
      <div className="mb-6 flex items-center gap-3">
        <ShieldAlert className="h-7 w-7 text-clay" />
        <h1 className="text-3xl font-black">Admin dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Total users", stats.totalUsers],
          ["Total orders", stats.totalOrders],
          ["Revenue", formatCurrency(stats.totalRevenue)],
          ["Pending products", stats.pendingProducts]
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-stone-200 bg-white p-5">
            <p className="text-sm text-stone-500">{label}</p>
            <strong className="mt-2 block text-2xl">{value}</strong>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <h2 className="text-2xl font-black">Product approvals</h2>
          <div className="mt-4 grid gap-3">
            {products.map((product) => (
              <div key={product._id} className="flex flex-col justify-between gap-3 rounded-md border border-stone-200 p-3 sm:flex-row sm:items-center">
                <div>
                  <strong>{product.title}</strong>
                  <p className="text-sm text-stone-500">{product.approvalStatus} · {product.artisanId?.shop?.name || product.artisanId?.name}</p>
                </div>
                <div className="flex gap-2">
                  <button className="icon-btn icon-btn-secondary" onClick={() => approve(product._id, false)} title="Reject product">
                    <XCircle className="h-4 w-4" />
                  </button>
                  <button className="icon-btn icon-btn-primary" onClick={() => approve(product._id, true)} title="Approve product">
                    <CheckCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {!products.length && <p className="rounded-md bg-stone-50 p-4 text-sm text-stone-500">No pending products to approve.</p>}
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-2xl font-black">
            <UsersRound className="h-5 w-5 text-clay" />
            Users
          </h2>
          <div className="mt-4 max-h-[460px] overflow-auto">
            {users.map((user) => (
              <div key={user._id} className="flex justify-between gap-3 border-b border-stone-100 py-3 text-sm last:border-0">
                <span>
                  <strong>{user.name}</strong>
                  <span className="block text-stone-500">{user.email}</span>
                </span>
                <span className="capitalize text-stone-500">{user.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-stone-200 bg-white p-5">
        <h2 className="text-2xl font-black">All orders</h2>
        <div className="mt-4 grid gap-3">
          {orders.map((order) => (
            <div key={order._id} className="grid gap-2 rounded-md border border-stone-200 p-3 text-sm md:grid-cols-[1.5fr_1fr_1fr_1fr]">
              <strong>{order._id}</strong>
              <span>{order.buyerId?.name}</span>
              <span>{formatCurrency(order.totalAmount)}</span>
              <span><span className={`rounded-md px-2 py-1 ${orderStatusClass(order.status)}`}>{order.status}</span></span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;
