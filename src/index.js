import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { PageProvider } from './contexts/PageContext';
import { ItemProvider } from './contexts/ItemContext';
import { UserProvider } from './contexts/UserContext';
import { BattleProvider } from './contexts/BattleContext';
import { InventoryProvider } from './contexts/InventoryContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { BattleLogProvider } from './contexts/BattleLogContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <PageProvider>
        <UserProvider>
          <ItemProvider>
            <InventoryProvider>
              <BattleProvider>
                <NotificationProvider>
                  <BattleLogProvider>
                    <App />
                  </BattleLogProvider>
                </NotificationProvider>
              </BattleProvider>
            </InventoryProvider>
          </ItemProvider>
        </UserProvider>
      </PageProvider>
    </AuthProvider>
  </React.StrictMode>
);