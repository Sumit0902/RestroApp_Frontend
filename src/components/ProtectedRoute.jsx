import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = () => {
  const isAuthenticated = useSelector((state) => state.auth.user);
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/sign-in" />;
};

export default ProtectedRoute;
