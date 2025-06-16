// components/Navigation.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Dice6, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUsers } from '../../contexts/UserContext';

const Navigation = ({ user }) => {
  const { logout } = useAuth();
  const { getUserById } = useUsers();
  const navigate = useNavigate();
  const location = useLocation();
  
  // UserContext에서 현재 사용자 정보 가져오기
  const currentUser = user ? getUserById(user.uid) : null;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  // 현재 경로에 따라 활성 상태 확인
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <h1 className="text-3xl font-bold text-white">밀고톡</h1>
          <div className="flex space-x-6">
            <button
              onClick={() => navigate('/shop')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/shop')
                  ? 'text-white bg-gray-800'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>상점</span>
            </button>
            <button
              onClick={() => navigate('/gambling')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/gambling')
                  ? 'text-white bg-gray-800'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Dice6 className="w-5 h-5" />
              <span>도박</span>
            </button>
            {user?.email === 'admin@test.com' && (
              <button
                onClick={() => navigate('/admin')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  isActive('/admin')
                    ? 'text-white bg-gray-800'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
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