// components/AdminPage.jsx
import React from 'react';
import Navigation from './Navigation';
import AddItem from './admin/AddItem';
import AddGold from './admin/AddGold';

const AdminPage = ({ user, userStats, setCurrentPage, handleLogout }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation user={user} userStats={userStats} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">관리자 대시보드</h2>
          <p className="text-gray-600">시스템 관리 및 모니터링</p>
        </div>

        <AddItem />

        <AddGold />
        
      </div>
    </div>
  );
};

export default AdminPage;
