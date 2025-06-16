import React, { useState } from 'react';
import { Users, Package, Shield, FileText } from 'lucide-react';
import ItemManagement from './admin/ItemManagement';
import UserList from './admin/UserList';
import TeamManagement from './admin/TeamManagement';
import BattleLog from './admin/BattleLog';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    {
      id: 'users',
      name: '밀고톡 러너 관리',
      icon: Users,
      component: UserList
    },
    {
      id: 'items',
      name: '상품 관리',
      icon: Package,
      component: ItemManagement
    },
    {
      id: 'teams',
      name: '팀 관리',
      icon: Shield,
      component: TeamManagement
    },
    {
      id: 'logs',
      name: '전투 로그',
      icon: FileText,
      component: BattleLog
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors flex-1 ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
              </button>
            ))}
          </div>

        </div>

        {/* 활성 탭 컨텐츠 */}
        <div>
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
