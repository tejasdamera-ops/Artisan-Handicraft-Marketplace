import { Bell, Heart, Menu, Search, ShoppingCart, Store, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications } from "../redux/notificationSlice.js";
import { logout } from "../redux/authSlice.js";

const navClass = ({ isActive }) =>
  `text-sm font-medium transition ${isActive ? "text-leaf" : "text-stone-600 hover:text-ink"}`;

const Layout = () => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const cartCount = useSelector((state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));
  const wishlistCount = useSelector((state) => state.wishlist.items.length);
  const unreadCount = useSelector((state) => state.notifications.unreadCount);
  const canBuy = !user || user.role === "buyer";
  const isArtisan = user?.role === "artisan";
  const showChatNav = user && user.role !== "buyer";

  useEffect(() => {
    if (user) dispatch(fetchNotifications());
  }, [dispatch, user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const roleLink = user?.role === "admin" ? (
    <NavLink className={navClass} to="/admin">
      Admin
    </NavLink>
  ) : user?.role === "artisan" ? (
    <NavLink className={navClass} to="/artisan">
      Dashboard
    </NavLink>
  ) : null;

  return (
    <div className="min-h-screen bg-linen">
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-linen/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 text-lg font-black text-ink">
            <Store className="h-6 w-6 text-clay" />
            Artisan Market
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {!isArtisan && (
              <NavLink className={navClass} to="/products">
                Products
              </NavLink>
            )}
            {roleLink}
            <NavLink className={navClass} to="/orders">
              Orders
            </NavLink>
            {showChatNav && (
              <NavLink className={navClass} to="/chat">
                Chat
              </NavLink>
            )}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            {!isArtisan && (
              <>
                <Link className="icon-btn icon-btn-secondary" to="/products" title="Search products">
                  <Search className="h-4 w-4" />
                </Link>
                <Link className="icon-btn icon-btn-secondary relative" to="/wishlist" title="Wishlist">
                  <Heart className="h-4 w-4" />
                  {wishlistCount > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-clay px-1.5 text-[10px] text-white">{wishlistCount}</span>}
                </Link>
              </>
            )}
            {canBuy && (
              <Link className="icon-btn icon-btn-secondary relative" to="/cart" title="Cart">
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-clay px-1.5 text-[10px] text-white">{cartCount}</span>}
              </Link>
            )}
            {user && !isArtisan && (
              <Link className="icon-btn icon-btn-secondary relative" to="/profile" title="Notifications and profile">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-marigold px-1.5 text-[10px] text-ink">{unreadCount}</span>}
              </Link>
            )}
            {user ? (
              <button className="btn-secondary" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <Link className="btn-primary" to="/login">
                <UserRound className="h-4 w-4" />
                Login
              </Link>
            )}
          </div>
          <button className="icon-btn icon-btn-secondary md:hidden" onClick={() => setOpen((value) => !value)} title="Menu">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
        {open && (
          <div className="border-t border-stone-200 px-4 py-4 md:hidden">
            <div className="grid gap-3">
              {(isArtisan ? ["/artisan", "/orders", "/chat"] : ["/products", ...(canBuy ? ["/cart"] : []), "/wishlist", "/orders", ...(showChatNav ? ["/chat"] : []), "/profile"]).map((path) => (
                <Link key={path} className="text-sm font-semibold capitalize text-stone-700" to={path} onClick={() => setOpen(false)}>
                  {path === "/artisan" ? "Dashboard" : path.slice(1)}
                </Link>
              ))}
              {user ? <button onClick={handleLogout} className="btn-secondary">Logout</button> : <Link className="btn-primary" to="/login">Login</Link>}
            </div>
          </div>
        )}
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-stone-200 bg-white">
        <div className="section flex flex-col justify-between gap-3 py-6 text-sm text-stone-500 sm:flex-row">
          <span>Artisan Market connects buyers with independent makers.</span>
          <span>Built with MongoDB, Express, React, and Node.</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
