import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const PublicRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (user) {
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/chat" replace />;
  }

  return children;
};

export const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/chat" replace />;
  }

  return children;
};
