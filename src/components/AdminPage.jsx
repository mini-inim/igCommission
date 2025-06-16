// components/AdminPage.jsx
import React from 'react';
import Navigation from './common/Navigation';
import ItemManagement from './admin/ItemManagement';
import UserList from './admin/UserList';

const AdminPage = ({ user }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        <div className="space-y-12">
          <UserList />
          <ItemManagement />
        </div> 
      </div>
    </div>
  );
};

export default AdminPage;
