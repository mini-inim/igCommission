import React from 'react';
import AuthPage from './components/AuthPage';
import ShopPage from './components/ShopPage';
import GamblingPage from './components/GamblingPage';
import AdminPage from './components/AdminPage';
import { useAuth } from './contexts/AuthContext';
import { usePage } from './contexts/PageContext';

const userStats = {
  coins: 12500,
  level: 15,
  wins: 48,
  losses: 32
};

function App() {
  const { user, logout } = useAuth();
  const { currentPage, setCurrentPage } = usePage();

  if (!user) {
    return <AuthPage />;
  }

  const pageProps = { user, userStats, setCurrentPage, handleLogout: logout };

  switch (currentPage) {
    case 'shop':
      return <ShopPage {...pageProps} />;
    case 'gambling':
      return <GamblingPage {...pageProps} />;
    case 'admin':
      return user.email === 'admin@test.com'
        ? <AdminPage {...pageProps} />
        : <ShopPage {...pageProps} />;
    default:
      return <ShopPage {...pageProps} />;
  }
}

export default App;
