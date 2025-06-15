import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { PageProvider } from './contexts/PageContext';
import { ItemProvider } from './contexts/ItemContext';
import { UserProvider } from './contexts/UserContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <PageProvider>
        <UserProvider>
          <ItemProvider>
            <App />
          </ItemProvider>
        </UserProvider>
      </PageProvider>
    </AuthProvider>
  </React.StrictMode>
);