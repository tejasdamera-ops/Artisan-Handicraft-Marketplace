import { useSelector } from "react-redux";
import ProductCard from "../components/ProductCard.jsx";

const Wishlist = () => {
  const items = useSelector((state) => state.wishlist.items);

  return (
    <section className="section">
      <h1 className="mb-6 text-3xl font-black">Wishlist</h1>
      {items.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-stone-200 bg-white p-8 text-center text-stone-600">Saved products will appear here.</p>
      )}
    </section>
  );
};

export default Wishlist;
