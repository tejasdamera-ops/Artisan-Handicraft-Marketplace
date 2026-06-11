import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";
import Spinner from "../components/Spinner.jsx";

const ProductList = () => {
  const [filters, setFilters] = useState({ keyword: "", category: "", region: "", minPrice: "", maxPrice: "", rating: "" });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
    setLoading(true);
    api
      .get("/products", { params })
      .then(({ data }) => {
        setProducts(data);
        setError("");
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load products."))
      .finally(() => setLoading(false));
  }, [filters]);

  const update = (event) => setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));

  return (
    <section className="section">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-clay">Marketplace</p>
        <h1 className="text-3xl font-black">Browse artisan products</h1>
      </div>

      <div className="mb-6 grid gap-3 rounded-lg border border-stone-200 bg-white p-4 md:grid-cols-6">
        <label className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input className="input pl-9" name="keyword" placeholder="Search by keyword" value={filters.keyword} onChange={update} />
        </label>
        <input className="input" name="category" placeholder="Category" value={filters.category} onChange={update} />
        <input className="input" name="region" placeholder="Region" value={filters.region} onChange={update} />
        <input className="input" name="minPrice" type="number" min="0" placeholder="Min price" value={filters.minPrice} onChange={update} />
        <input className="input" name="maxPrice" type="number" min="0" placeholder="Max price" value={filters.maxPrice} onChange={update} />
        <select className="input md:col-span-2" name="rating" value={filters.rating} onChange={update}>
          <option value="">Any rating</option>
          <option value="4">4 stars and up</option>
          <option value="3">3 stars and up</option>
        </select>
        <button className="btn-secondary md:col-span-4" onClick={() => setFilters({ keyword: "", category: "", region: "", minPrice: "", maxPrice: "", rating: "" })}>
          <SlidersHorizontal className="h-4 w-4" />
          Reset filters
        </button>
      </div>

      {error && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? (
        <Spinner />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductList;
