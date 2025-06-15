// components/Navigation.jsx
import React from 'react';
import { ShoppingBag, Dice6, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUsers } from '../contexts/UserContext';

const Navigation = ({ user, setCurrentPage }) => {
  const { logout } = useAuth();
  const { getUserById } = useUsers();
  
  // UserContext에서 현재 사용자 정보 가져오기
  const currentUser = user ? getUserById(user.uid) : null;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold text-white">커뮤니티 이름 들어갈 칸</h1>
          <div className="flex space-x-6">
            <button
              onClick={() => setCurrentPage('shop')}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>상점</span>
            </button>
            <button
              onClick={() => setCurrentPage('gambling')}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all"
            >
              <Dice6 className="w-5 h-5" />
              <span>도박</span>
            </button>
            {user?.email === 'admin@test.com' && (
              <button
                onClick={() => setCurrentPage('admin')}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all"
              >
                <Shield className="w-5 h-5" />
                <span>관리자</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-white font-medium">
              {user?.displayName || user?.email || '사용자'}
            </p>
            <p className="text-yellow-400 text-sm">
              보유 골드: {(currentUser?.gold || 0).toLocaleString()}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>로그아웃</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;