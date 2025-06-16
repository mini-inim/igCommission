import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = ({ user }) => {
  return user?.email === 'admin@test.com' ? <Outlet /> : <Navigate to="/shop" replace />;
};

export default AdminRoute;