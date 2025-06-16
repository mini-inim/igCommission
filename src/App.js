import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import ShopPage from './components/ShopPage';
import GamblingPage from './components/GamblingPage';
import AdminPage from './components/AdminPage';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './page/router/ProtectedRoute'
import AdminRoute from './page/router/AdminRoute'

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* 로그인 페이지 - 로그인되지 않은 경우에만 접근 가능 */}
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/shop" replace /> : <AuthPage />
          } 
        />
        
        {/* 보호된 라우트들 - 로그인 필요 */}
        <Route element={<ProtectedRoute user={user} />}>
          <Route 
            path="/shop" 
            element={<ShopPage user={user} />} 
          />
          <Route 
            path="/gambling" 
            element={<GamblingPage user={user} />} 
          />
          
          {/* 관리자 전용 라우트 */}
          <Route element={<AdminRoute user={user} />}>
            <Route 
              path="/admin" 
              element={<AdminPage user={user} />} 
            />
          </Route>
        </Route>

        {/* 기본 라우트 - 루트 경로 접근 시 리다이렉트 */}
        <Route 
          path="/" 
          element={
            user ? <Navigate to="/shop" replace /> : <Navigate to="/login" replace />
          } 
        />
        
        {/* 404 처리 - 존재하지 않는 경로 */}
        <Route 
          path="*" 
          element={
            user ? <Navigate to="/shop" replace /> : <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;