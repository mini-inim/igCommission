// components/common/Navigation.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Dice6, Shield, LogOut, Bell, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUsers } from '../../contexts/UserContext';
import { useNotifications } from '../../contexts/NotificationContext';

const Navigation = ({ user }) => {
  const { logout } = useAuth();
  const { getUserById } = useUsers();
  const { notifications, unreadCount, markAsRead, markAllAsRead, getNotificationEmoji, getNotificationColor } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // UserContext에서 현재 사용자 정보 가져오기
  const currentUser = user ? getUserById(user.uid) : null;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      setShowMobileMenu(false);
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  // 현재 경로에 따라 활성 상태 확인
  const isActive = (path) => location.pathname === path;

  // 알림 클릭 처리
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
  };

  // 네비게이션 클릭 시 모바일 메뉴 닫기
  const handleNavClick = (path) => {
    navigate(path);
    setShowMobileMenu(false);
  };

  // 시간 포맷팅
  const formatTime = (date) => {
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes}분 전`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}시간 전`;
    } else {
      return `${Math.floor(diffInHours / 24)}일 전`;
    }
  };

  return (
    <>
      <nav className="bg-gray-900 border-b border-gray-700 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* 로고 + 데스크톱 네비게이션 */}
          <div className="flex items-center space-x-8">
            <h1 className="text-xl sm:text-2xl font-bold text-white">밀고톡</h1>
            
            {/* 데스크톱 네비게이션 */}
            <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => navigate('/shop')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/shop')
                  ? 'text-white bg-gray-800'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>아이템</span>
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
              <span>카지노</span>
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

          {/* 우측 컨트롤 */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* 알림 버튼 */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
              >
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* 알림 드롭다운 */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">알림</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        모두 읽음
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>알림이 없습니다</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notification.isRead ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                              <span className="text-lg">
                                {getNotificationEmoji(notification.type)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatTime(notification.createdAt)}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 사용자 정보 - 데스크톱만 */}
            <div className="hidden sm:block text-left">
              <p className="text-white font-medium text-sm">
                {user?.displayName || user?.email || '사용자'}
              </p>
              <p className="text-yellow-400 text-xs">
                골드: {(currentUser?.gold || 0).toLocaleString()}
              </p>
            </div>

            {/* 데스크톱 로그아웃 버튼 */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center space-x-2 px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline">로그아웃</span>
            </button>

            {/* 모바일 햄버거 메뉴 버튼 */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {showMobileMenu && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-700 pt-4">
            {/* 사용자 정보 */}
            <div className="px-4 py-3 border-b border-gray-700 mb-3">
              <p className="text-white font-medium">
                {user?.displayName || user?.email || '사용자'}
              </p>
              <p className="text-yellow-400 text-sm">
                보유 골드: {(currentUser?.gold || 0).toLocaleString()}
              </p>
            </div>

            {/* 네비게이션 메뉴 */}
            <div className="space-y-2">
              <button
                onClick={() => handleNavClick('/shop')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive('/shop')
                    ? 'text-white bg-gray-800'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>아이템</span>
              </button>
              <button
                onClick={() => handleNavClick('/gambling')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive('/gambling')
                    ? 'text-white bg-gray-800'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Dice6 className="w-5 h-5" />
                <span>카지노</span>
              </button>
              {user?.email === 'admin@test.com' && (
                <button
                  onClick={() => handleNavClick('/admin')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive('/admin')
                      ? 'text-white bg-gray-800'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span>관리자</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* 알림 드롭다운 닫기 위한 오버레이 */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)}
        />
      )}

      {/* 모바일 메뉴 닫기 위한 오버레이 */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 z-30 md:hidden" 
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </>
  );
};

export default Navigation;