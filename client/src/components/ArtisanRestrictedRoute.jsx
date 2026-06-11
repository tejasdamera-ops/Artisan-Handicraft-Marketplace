import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ArtisanRestrictedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  if (user?.role === "artisan") {
    return <Navigate to="/artisan" replace />;
  }

  return children;
};

export default ArtisanRestrictedRoute;
