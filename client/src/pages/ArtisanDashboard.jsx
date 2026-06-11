import { PackagePlus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import api from "../api/client.js";
import Spinner from "../components/Spinner.jsx";
import { formatCurrency, orderStatusClass } from "../utils/format.js";

const emptyProduct = { title: "", description: "", price: "", category: "", stock: "", region: "", materials: "" };

const ArtisanDashboard = () => {
  const user = useSelector((state) => state.auth.user);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [productsRes, ordersRes] = await Promise.all([
      api.get("/products", { params: { includePending: true, artisanId: user?._id } }),
      api.get("/orders/my")
    ]);
    setProducts(productsRes.data);
    setOrders(ordersRes.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submitProduct = async (event) => {
    event.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    [...images].forEach((image) => data.append("images", image));
    await api.post("/products", data);
    toast.success("Product submitted for admin approval");
    setForm(emptyProduct);
    setImages([]);
    load();
  };

  const deleteProduct = async (id) => {
    await api.delete(`/products/${id}`);
    toast.success("Product deleted");
    load();
  };

  const updateStatus = async (orderId, status) => {
    await api.put(`/orders/${orderId}/status`, { status });
    toast.success("Order status updated");
    load();
  };

  if (loading) return <Spinner />;

  return (
    <section className="section grid gap-6 xl:grid-cols-[420px_1fr]">
      <form className="h-fit rounded-lg border border-stone-200 bg-white p-5" onSubmit={submitProduct}>
        <h1 className="flex items-center gap-2 text-2xl font-black">
          <PackagePlus className="h-5 w-5 text-clay" />
          Add product
        </h1>
        <div className="mt-5 grid gap-3">
          {["title", "description", "price", "category", "stock", "region", "materials"].map((field) => (
            field === "description" ? (
              <textarea key={field} className="input min-h-24" name={field} placeholder={field} value={form[field]} onChange={update} required />
            ) : (
              <input key={field} className="input" name={field} type={["price", "stock"].includes(field) ? "number" : "text"} placeholder={field} value={form[field]} onChange={update} required={!["materials"].includes(field)} />
            )
          ))}
          <input className="input" type="file" accept="image/*" multiple onChange={(event) => setImages(event.target.files)} />
          <button className="btn-primary">
            <Save className="h-4 w-4" />
            Submit for approval
          </button>
        </div>
      </form>

      <div className="grid gap-6">
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <h2 className="text-2xl font-black">Products</h2>
          <div className="mt-4 grid gap-3">
            {products.map((product) => (
              <div key={product._id} className="flex flex-col justify-between gap-3 rounded-md border border-stone-200 p-3 sm:flex-row sm:items-center">
                <div>
                  <strong>{product.title}</strong>
                  <p className="text-sm text-stone-500">{formatCurrency(product.price)} · {product.approvalStatus}</p>
                </div>
                <button className="icon-btn icon-btn-secondary" onClick={() => deleteProduct(product._id)} title="Delete product">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <h2 className="text-2xl font-black">Orders</h2>
          <div className="mt-4 grid gap-3">
            {orders.map((order) => (
              <div key={order._id} className="rounded-md border border-stone-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <strong>{order._id}</strong>
                  <span className={`rounded-md px-2 py-1 text-sm ${orderStatusClass(order.status)}`}>{order.status}</span>
                </div>
                <p className="mt-2 text-sm text-stone-500">{formatCurrency(order.totalAmount)} · {order.items.length} item(s)</p>
                <select className="input mt-3" value={order.status} onChange={(event) => updateStatus(order._id, event.target.value)}>
                  {["Placed", "Shipped", "Delivered"].map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArtisanDashboard;
