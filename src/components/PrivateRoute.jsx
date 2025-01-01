import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (currentUser && window.location.pathname === '/login') {
    return <Navigate to="/" />;
  }

  return children;
}

export default PrivateRoute;
