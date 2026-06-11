import { ArrowRight, MapPin, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";
import Spinner from "../components/Spinner.jsx";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products")
      .then(({ data }) => setProducts(data.slice(0, 4)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="bg-[url('https://images.unsplash.com/photo-1606722590483-6951b5ea92ad?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center">
        <div className="bg-ink/55">
          <div className="section flex min-h-[520px] items-center py-16">
            <div className="max-w-2xl text-white">
              <p className="mb-4 inline-flex items-center gap-2 rounded-md bg-white/15 px-3 py-1 text-sm backdrop-blur">
                <Sparkles className="h-4 w-4 text-marigold" />
                Handmade goods from verified artisans
              </p>
              <h1 className="text-4xl font-black leading-tight sm:text-6xl">Artisan Market</h1>
              <p className="mt-5 max-w-xl text-lg text-stone-100">
                Discover pottery, textiles, decor, jewelry, and slow-made craft with direct shop stories,
                verified reviews, secure checkout, and real order tracking.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link className="btn-primary bg-marigold text-ink hover:bg-white" to="/products">
                  Shop handmade
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link className="btn-secondary border-white/50 bg-white/10 text-white hover:bg-white hover:text-ink" to="/register">
                  Start selling
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section grid gap-4 py-8 md:grid-cols-3">
        {[
          ["Verified makers", ShieldCheck],
          ["Regional craft stories", MapPin],
          ["Tracked orders", Truck]
        ].map(([label, Icon]) => (
          <div key={label} className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-4">
            <span className="rounded-md bg-leaf/10 p-2 text-leaf">
              <Icon className="h-5 w-5" />
            </span>
            <span className="font-semibold">{label}</span>
          </div>
        ))}
      </section>

      <section className="section">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-clay">Featured</p>
            <h2 className="text-2xl font-black">Fresh from artisan shops</h2>
          </div>
          <Link className="text-sm font-semibold text-leaf" to="/products">
            View all
          </Link>
        </div>
        {loading ? <Spinner /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <ProductCard key={product._id} product={product} />)}</div>}
      </section>
    </>
  );
};

export default Home;
