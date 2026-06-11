import { Heart, ShoppingBag, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { addToCart } from "../redux/cartSlice.js";
import { toggleWishlist } from "../redux/wishlistSlice.js";
import { formatCurrency } from "../utils/format.js";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const wishlist = useSelector((state) => state.wishlist.items);
  const saved = wishlist.some((item) => item._id === product._id);
  const canBuy = !user || user.role === "buyer";

  const handleCart = () => {
    dispatch(addToCart(product));
    toast.success("Added to cart");
  };

  const handleWishlist = () => {
    dispatch(toggleWishlist(product));
    toast.success(saved ? "Removed from wishlist" : "Saved to wishlist");
  };

  return (
    <article className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <Link to={`/products/${product._id}`} className="block aspect-[4/3] bg-stone-100">
        <img
          src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1459908676235-d5f02a50184b?auto=format&fit=crop&w=900&q=80"}
          alt={product.title}
          className="h-full w-full object-cover"
        />
      </Link>
      <div className="space-y-3 p-4">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
            <span>{product.category}</span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-marigold text-marigold" />
              {product.ratings?.average || "New"}
            </span>
          </div>
          <Link to={`/products/${product._id}`} className="mt-1 block font-semibold text-ink hover:text-leaf">
            {product.title}
          </Link>
          <p className="text-sm text-stone-500">{product.region}</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="font-bold text-clay">{formatCurrency(product.price)}</span>
          <div className="flex gap-2">
            <button className="icon-btn icon-btn-secondary" onClick={handleWishlist} title="Wishlist">
              <Heart className={`h-4 w-4 ${saved ? "fill-clay text-clay" : ""}`} />
            </button>
            {canBuy && (
              <button className="icon-btn icon-btn-primary" onClick={handleCart} title="Add to cart">
                <ShoppingBag className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
