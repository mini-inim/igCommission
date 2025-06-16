import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = ({ user }) => {
  const isAdmin = user?.email === 'admin@test.com' || user?.email === 'watcher@crepe.com';
  return isAdmin ? <Outlet /> : <Navigate to="/shop" replace />;
};

export default AdminRoute;
