import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  // You can also handle a loading state if you want:
  // const { user, loading } = useAuth();
  // if (loading) return <div className="text-center mt-10 text-lg">Loading...</div>;

  return user ? children : <Navigate to="/signin" />;
};

export default PrivateRoute;
