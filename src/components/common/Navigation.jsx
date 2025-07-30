// components/common/Navigation.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Dice6, Shield, LogOut, Bell, Menu, X, UserX, AlertTriangle } from 'lucide-react';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
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

  // 회원탈퇴 함수
  const handleDeleteAccount = async () => {
    try {
      setDeleteLoading(true);

      const { deleteUser } = await import('firebase/auth');
      const { getAuth } = await import('firebase/auth');
      
      const auth = getAuth();
      const currentAuthUser = auth.currentUser;

      if (!currentAuthUser) {
        throw new Error('로그인 상태를 확인할 수 없습니다.');
      }

      // Firestore에서 사용자 데이터 삭제
      await deleteUserData(currentAuthUser.uid);

      // Firebase Auth에서 계정 삭제
      await deleteUser(currentAuthUser);

      alert('계정이 성공적으로 삭제되었습니다.');
      
      // 로그인 페이지로 리다이렉트
      navigate('/login');

    } catch (error) {
      console.error('계정 삭제 실패:', error);
      
      if (error.code === 'auth/requires-recent-login') {
        alert('보안을 위해 다시 로그인한 후 계정 삭제를 시도해주세요.');
        // 로그아웃 후 로그인 페이지로
        await logout();
        navigate('/login');
      } else {
        alert(`계정 삭제 실패: ${error.message}`);
      }
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
      setShowMobileMenu(false);
    }
  };

  // Firestore 데이터 삭제 함수
  const deleteUserData = async (userId) => {
    try {
      const { doc, deleteDoc, collection, getDocs } = await import('firebase/firestore');
      const { db } = await import('../../firebase');

      // 하위 컬렉션들 삭제
      const subcollections = ['inventory', 'battles', 'notifications', 'battleLogs'];
      
      for (const collectionName of subcollections) {
        try {
          const subcollectionRef = collection(db, 'users', userId, collectionName);
          const snapshot = await getDocs(subcollectionRef);
          
          const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
          if (deletePromises.length > 0) {
            await Promise.all(deletePromises);
          }
        } catch (error) {
          console.log(`${collectionName} 삭제 중 오류:`, error);
        }
      }

      // 메인 사용자 문서 삭제
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);

      console.log('사용자 데이터 삭제 완료');
    } catch (error) {
      console.error('사용자 데이터 삭제 실패:', error);
      throw error;
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
    setShowMobileMenu(false); // 먼저 메뉴 닫기
    setTimeout(() => {
      navigate(path); // 약간의 딜레이 후 네비게이션
    }, 100);
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

            {/* 데스크톱 메뉴 버튼들 */}
            <div className="hidden sm:flex items-center space-x-2">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
              >
                <UserX className="w-4 h-4" />
                <span className="hidden lg:inline">회원탈퇴</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">로그아웃</span>
              </button>
            </div>

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
          <div className="md:hidden mt-4 pb-4 border-t border-gray-700 pt-4 relative z-50">
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
              
              {/* 모바일 회원탈퇴 버튼 */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <UserX className="w-5 h-5" />
                <span>회원탈퇴</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* 회원탈퇴 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">계정 삭제 확인</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                정말로 계정을 삭제하시겠습니까?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800 font-medium mb-2">
                  ⚠️ 삭제되는 데이터:
                </p>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• 사용자 계정 정보</li>
                  <li>• 게임 진행 상황</li>
                  <li>• 보유 아이템 및 골드</li>
                  <li>• 배틀 기록</li>
                  <li>• 모든 개인 데이터</li>
                </ul>
                <p className="text-sm text-red-800 font-medium mt-2">
                  이 작업은 되돌릴 수 없습니다!
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {deleteLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  '계정 삭제'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
          className="fixed inset-0 z-20 md:hidden" 
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </>
  );
};

export default Navigation;