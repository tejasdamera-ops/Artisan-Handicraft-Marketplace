import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ArtisanRestrictedRoute from "./components/ArtisanRestrictedRoute.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ArtisanDashboard from "./pages/ArtisanDashboard.jsx";
import ArtisanShop from "./pages/ArtisanShop.jsx";
import Auth from "./pages/Auth.jsx";
import Cart from "./pages/Cart.jsx";
import Chat from "./pages/Chat.jsx";
import Checkout from "./pages/Checkout.jsx";
import Home from "./pages/Home.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";
import Orders from "./pages/Orders.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import ProductList from "./pages/ProductList.jsx";
import Profile from "./pages/Profile.jsx";
import Wishlist from "./pages/Wishlist.jsx";

const App = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route index element={<ArtisanRestrictedRoute><Home /></ArtisanRestrictedRoute>} />
      <Route path="/products" element={<ArtisanRestrictedRoute><ProductList /></ArtisanRestrictedRoute>} />
      <Route path="/products/:id" element={<ArtisanRestrictedRoute><ProductDetail /></ArtisanRestrictedRoute>} />
      <Route path="/shops/:id" element={<ArtisanRestrictedRoute><ArtisanShop /></ArtisanRestrictedRoute>} />
      <Route path="/cart" element={<ArtisanRestrictedRoute><Cart /></ArtisanRestrictedRoute>} />
      <Route path="/wishlist" element={<ArtisanRestrictedRoute><Wishlist /></ArtisanRestrictedRoute>} />
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/register" element={<Auth mode="register" />} />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute roles={["buyer"]}>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <OrderDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ArtisanRestrictedRoute>
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </ArtisanRestrictedRoute>
        }
      />
      <Route
        path="/artisan"
        element={
          <ProtectedRoute roles={["artisan"]}>
            <ArtisanDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Route>
  </Routes>
);

export default App;
