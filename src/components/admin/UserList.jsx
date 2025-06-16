// components/admin/UserList.jsx
import React, { useState } from "react";
import { Search, User, Crown, Coins, Heart } from 'lucide-react';
import { useUsers } from "../../contexts/UserContext";
import { useBattle } from "../../contexts/BattleContext";
import { useInventory } from "../../contexts/InventoryContext";

const UserList = () => {
  const { users, updateUser, loading } = useUsers();
  const { battleUsers, teams, updateTeamMemberCounts } = useBattle();
  const [searchTerm, setSearchTerm] = useState("");
  const [updateLoading, setUpdateLoading] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });
  const [userInventories, setUserInventories] = useState({});

  // 사용자의 부상 정보 가져오기
  const getUserInjuries = (userId) => {
    const battleUser = battleUsers.find(u => u.id === userId);
    return battleUser?.injuries || 0;
  };

// 사용자 인벤토리 표시 컴포넌트
const UserInventoryDisplay = ({ userId, loadUserInventory, userInventories }) => {
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    loadUserInventory(userId);
  }, [userId]);

  const items = userInventories[userId] || [];

  const getItemEmoji = (itemName) => {
    const emojiMap = {
      '공격권': '⚔️',
      '특수 공격권': '💥',
      '방어권': '🛡️',
      '치료권': '💚',
      '특수 치료권': '✨'
    };
    return emojiMap[itemName] || '📦';
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        🎒 보유 아이템
      </label>
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 min-h-[100px]">
        <div className="space-y-2 max-h-20 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-2">보유 아이템 없음</p>
          ) : (
            items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white px-2 py-1 rounded text-xs">
                <div className="flex items-center space-x-1">
                  <span className="text-sm">{getItemEmoji(item.itemName)}</span>
                  <span className="font-medium text-gray-700">{item.itemName}</span>
                </div>
                <span className="font-bold text-blue-600">x{item.quantity}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

  // 사용자의 인벤토리 로드 (필요시)
  const loadUserInventory = async (userId) => {
    if (userInventories[userId]) return userInventories[userId];
    
    try {
      const { getDocs, collection } = await import('firebase/firestore');
      const { db } = await import('../../firebase');
      
      const inventoryRef = collection(db, 'users', userId, 'inventory');
      const inventorySnap = await getDocs(inventoryRef);
      
      const items = inventorySnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).filter(item => item.quantity > 0);
      
      setUserInventories(prev => ({ ...prev, [userId]: items }));
      return items;
    } catch (error) {
      console.error('인벤토리 로드 실패:', error);
      return [];
    }
  };

  // 검색 필터링
  const filteredUsers = users.filter(user => {
    const displayName = user.displayName || user.email || '';
    return displayName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // 메시지 표시
  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  // 팀 업데이트 함수
  const handleTeamUpdate = async (userId, teamName) => {
    try {
      setUpdateLoading(prev => ({ ...prev, [userId]: true }));
      
      await updateUser(userId, { team: teamName || null });
      
      const user = users.find(u => u.id === userId);
      if (teamName) {
        showMessage(`${user?.displayName || '사용자'}를 ${teamName}으로 배정했습니다.`, 'success');
      } else {
        showMessage(`${user?.displayName || '사용자'}의 팀 배정을 해제했습니다.`, 'success');
      }
      
      // 팀 멤버 수 업데이트
      updateTeamMemberCounts();
      
    } catch (error) {
      console.error('팀 업데이트 실패:', error);
      showMessage('팀 업데이트 중 오류가 발생했습니다.', 'error');
    } finally {
      setUpdateLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // 골드 업데이트 함수
  const handleGoldUpdate = async (userId, currentGold, changeAmount, operation) => {
    try {
      setUpdateLoading(prev => ({ ...prev, [userId]: true }));

      let newGold;
      if (operation === "add") {
        newGold = currentGold + changeAmount;
      } else if (operation === "subtract") {
        newGold = Math.max(0, currentGold - changeAmount);
      } else if (operation === "set") {
        newGold = changeAmount;
      }

      await updateUser(userId, { gold: newGold });
      
      const user = users.find(u => u.id === userId);
      showMessage(`${user?.displayName || '사용자'}의 골드가 ${newGold.toLocaleString()}으로 업데이트되었습니다.`, 'success');
      
    } catch (error) {
      console.error('골드 업데이트 실패:', error);
      showMessage('골드 업데이트 중 오류가 발생했습니다.', 'error');
    } finally {
      setUpdateLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // 팀 색상 가져오기
  const getTeamColor = (teamName) => {
    const team = teams.find(t => t.name === teamName);
    return team?.color || '#6b7280';
  };

  // 팀 스타일 가져오기
  const getTeamStyle = (teamName) => {
    if (!teamName) return 'bg-gray-100 text-gray-600 border border-gray-200';
    
    const team = teams.find(t => t.name === teamName);
    if (!team) return 'bg-gray-100 text-gray-600 border border-gray-200';
    
    // 색상에 따른 스타일 매핑
    const colorMap = {
      '#dc2626': 'bg-red-100 text-red-700 border border-red-200',
      '#2563eb': 'bg-blue-100 text-blue-700 border border-blue-200', 
      '#059669': 'bg-green-100 text-green-700 border border-green-200',
      '#7c3aed': 'bg-purple-100 text-purple-700 border border-purple-200',
      '#ea580c': 'bg-orange-100 text-orange-700 border border-orange-200',
      '#db2777': 'bg-pink-100 text-pink-700 border border-pink-200',
      '#0891b2': 'bg-cyan-100 text-cyan-700 border border-cyan-200',
      '#ca8a04': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    };
    
    return colorMap[team.color] || 'bg-gray-100 text-gray-600 border border-gray-200';
  };

  const getMessageStyle = (type) => {
    const baseStyle = "fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300";
    switch (type) {
      case 'success':
        return `${baseStyle} bg-green-500 text-white`;
      case 'error':
        return `${baseStyle} bg-red-500 text-white`;
      default:
        return `${baseStyle} bg-blue-500 text-white`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center text-gray-500">사용자 정보 로딩 중...</div>
      </div>
    );
  }

  return (
    <div>
      {/* 메시지 알림 */}
      {message.text && (
        <div className={getMessageStyle(message.type)}>
          {message.text}
        </div>
      )}

      {/* 통일된 스타일로 변경 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5" />
              밀고톡 러너 관리
            </h2>
            <div className="w-full max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="사용자 이름으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? '검색 결과가 없습니다.' : '등록된 사용자가 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    {/* 사용자 기본 정보 */}
                    <div className="flex items-center gap-4 flex-1">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                        style={{ backgroundColor: getTeamColor(user.team) }}
                      >
                        {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">
                          {user.displayName || user.email}
                        </h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        
                        {/* 상태 표시 */}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-sm">
                            <Coins className="w-4 h-4 text-yellow-600" />
                            <span className="font-bold text-yellow-600">{(user.gold || 0).toLocaleString()}</span>
                          </span>
                          
                          <span className={`px-2 py-1 rounded text-sm font-medium ${getTeamStyle(user.team)}`}>
                            {user.team || '팀 없음'}
                          </span>

                          <span className={`flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${
                            getUserInjuries(user.id) >= 4
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : getUserInjuries(user.id) >= 2
                              ? 'bg-orange-100 text-orange-700 border border-orange-200'
                              : 'bg-green-100 text-green-700 border border-green-200'
                          }`}>
                            <Heart className="w-3 h-3" />
                            {getUserInjuries(user.id)}/4
                            {getUserInjuries(user.id) >= 4 && ' (탈락)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 로딩 표시 */}
                    {updateLoading[user.id] && (
                      <div className="text-sm text-blue-600 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                        업데이트 중...
                      </div>
                    )}
                  </div>

                  {/* 관리 섹션 */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
                    {/* 팀 배정 */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Crown className="w-4 h-4 inline mr-1" />
                        팀 배정
                      </label>
                      <select
                        value={user.team || ''}
                        onChange={(e) => handleTeamUpdate(user.id, e.target.value || null)}
                        disabled={updateLoading[user.id]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <option value="">팀 선택</option>
                        {teams.map((team) => (
                          <option key={team.id} value={team.name}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 보유 아이템 */}
                    <div>
                      <UserInventoryDisplay 
                        userId={user.id} 
                        loadUserInventory={loadUserInventory} 
                        userInventories={userInventories} 
                      />
                    </div>

                    {/* 골드 조정 */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Coins className="w-4 h-4 inline mr-1" />
                        골드 조정
                      </label>
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            onClick={() => handleGoldUpdate(user.id, user.gold || 0, 100, "add")}
                            disabled={updateLoading[user.id]}
                            className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                          >
                            +100
                          </button>
                          <button
                            onClick={() => handleGoldUpdate(user.id, user.gold || 0, 500, "add")}
                            disabled={updateLoading[user.id]}
                            className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                          >
                            +500
                          </button>
                          <button
                            onClick={() => handleGoldUpdate(user.id, user.gold || 0, 1000, "add")}
                            disabled={updateLoading[user.id]}
                            className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                          >
                            +1000
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <button
                            onClick={() => handleGoldUpdate(user.id, user.gold || 0, 100, "subtract")}
                            disabled={updateLoading[user.id]}
                            className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            -100
                          </button>
                          <button
                            onClick={() => handleGoldUpdate(user.id, user.gold || 0, 0, "set")}
                            disabled={updateLoading[user.id]}
                            className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors disabled:opacity-50"
                          >
                            초기화
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;