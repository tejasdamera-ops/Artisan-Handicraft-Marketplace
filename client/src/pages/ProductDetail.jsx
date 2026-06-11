import { Heart, MessageCircle, ShoppingBag, Star } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api from "../api/client.js";
import Spinner from "../components/Spinner.jsx";
import { addToCart } from "../redux/cartSlice.js";
import { toggleWishlist } from "../redux/wishlistSlice.js";
import { formatCurrency } from "../utils/format.js";

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  useEffect(() => {
    Promise.all([api.get(`/products/${id}`), api.get(`/reviews/${id}`)])
      .then(([productRes, reviewRes]) => {
        setProduct(productRes.data);
        setReviews(reviewRes.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const submitReview = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.post("/reviews", { productId: id, ...reviewForm });
      setReviews((current) => [data, ...current.filter((review) => review._id !== data._id)]);
      setReviewForm({ rating: 5, comment: "" });
      toast.success("Review saved");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save review");
    }
  };

  if (loading) return <Spinner />;
  if (!product) return <p className="section">Product not found.</p>;

  const canBuy = !user || user.role === "buyer";

  return (
    <section className="section grid gap-8 lg:grid-cols-2">
      <div className="grid gap-3">
        <div className="aspect-[4/3] overflow-hidden rounded-lg bg-stone-100">
          <img src={product.images?.[0]?.url} alt={product.title} className="h-full w-full object-cover" />
        </div>
        <div className="grid grid-cols-5 gap-2">
          {product.images?.slice(0, 5).map((image) => (
            <img key={image.url} src={image.url} alt="" className="aspect-square rounded-md object-cover" />
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-clay">{product.category}</p>
        <h1 className="mt-1 text-3xl font-black">{product.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-stone-600">
          <span className="inline-flex items-center gap-1">
            <Star className="h-4 w-4 fill-marigold text-marigold" />
            {product.ratings?.average || "New"} ({product.ratings?.count || 0})
          </span>
          <span>{product.region}</span>
          <Link className="font-semibold text-leaf" to={`/shops/${product.artisanId?._id}`}>
            {product.artisanId?.shop?.name || product.artisanId?.name}
          </Link>
        </div>
        <p className="mt-5 text-3xl font-black text-clay">{formatCurrency(product.price)}</p>
        <p className="mt-5 leading-7 text-stone-700">{product.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {product.materials?.map((material) => (
            <span key={material} className="rounded-md bg-white px-3 py-1 text-sm text-stone-600 ring-1 ring-stone-200">
              {material}
            </span>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {canBuy && (
            <button className="btn-primary" onClick={() => dispatch(addToCart(product))}>
              <ShoppingBag className="h-4 w-4" />
              Add to cart
            </button>
          )}
          <button className="btn-secondary" onClick={() => dispatch(toggleWishlist(product))}>
            <Heart className="h-4 w-4" />
            Wishlist
          </button>
          {user && product.artisanId?._id !== user._id && (
            <Link className="btn-secondary" to={`/chat?user=${product.artisanId?._id}`}>
              <MessageCircle className="h-4 w-4" />
              Message artisan
            </Link>
          )}
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-black">Reviews</h2>
          {user?.role === "buyer" && (
            <form className="mt-4 grid gap-3 rounded-lg border border-stone-200 bg-white p-4" onSubmit={submitReview}>
              <select className="input" value={reviewForm.rating} onChange={(event) => setReviewForm({ ...reviewForm, rating: Number(event.target.value) })}>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>{rating} stars</option>
                ))}
              </select>
              <textarea className="input min-h-24" placeholder="Write your review after purchase" value={reviewForm.comment} onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })} />
              <button className="btn-primary" type="submit">Submit review</button>
            </form>
          )}
          <div className="mt-4 grid gap-3">
            {reviews.map((review) => (
              <div key={review._id} className="rounded-lg border border-stone-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <strong>{review.buyerId?.name}</strong>
                  <span className="text-sm text-marigold">{review.rating} stars</span>
                </div>
                <p className="mt-2 text-sm text-stone-600">{review.comment}</p>
              </div>
            ))}
            {!reviews.length && <p className="text-sm text-stone-500">No reviews yet.</p>}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetail;
