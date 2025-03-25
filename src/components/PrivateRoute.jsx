import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="text-center mt-10 text-lg">Loading...</div>;
  }

  return user ? children : <Navigate to="/signin" />;
};

export default PrivateRoute;
