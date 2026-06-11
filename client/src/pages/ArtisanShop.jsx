import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";
import Spinner from "../components/Spinner.jsx";

const ArtisanShop = () => {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/products/shop/${id}`)
      .then(({ data }) => setShop(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!shop) return <p className="section">Shop not found.</p>;

  return (
    <section className="section">
      <div className="mb-8 flex flex-col gap-5 rounded-lg border border-stone-200 bg-white p-6 sm:flex-row sm:items-center">
        <img src={shop.artisan.shop?.profilePhoto?.url || shop.artisan.avatar?.url || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80"} alt={shop.artisan.name} className="h-24 w-24 rounded-lg object-cover" />
        <div>
          <h1 className="text-3xl font-black">{shop.artisan.shop?.name || shop.artisan.name}</h1>
          <p className="mt-2 max-w-2xl text-stone-600">{shop.artisan.shop?.bio}</p>
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-stone-500">
            <MapPin className="h-4 w-4" />
            {shop.artisan.shop?.location}
          </p>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {shop.products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default ArtisanShop;
