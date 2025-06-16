// components/admin/UserList.jsx
import React, { useState } from "react";
import { useUsers } from "../../contexts/UserContext";
import { useBattle } from "../../contexts/BattleContext";
import { useInventory } from "../../contexts/InventoryContext";

const UserList = () => {
  const { users, updateUser, loading } = useUsers();
  const { battleUsers } = useBattle();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeams, setSelectedTeams] = useState({});
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
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border-2 border-purple-100 min-h-[120px]">
        <div className="space-y-2 max-h-24 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-2">보유 아이템 없음</p>
          ) : (
            items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getItemEmoji(item.itemName)}</span>
                  <span className="text-sm font-medium text-gray-700">{item.itemName}</span>
                </div>
                <span className="text-sm font-bold text-purple-600">x{item.quantity}</span>
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
  const handleTeamUpdate = async (userId, teamNumber) => {
    try {
      setUpdateLoading(prev => ({ ...prev, [userId]: true }));
      
      const teamName = teamNumber ? `${teamNumber}팀` : null;
      await updateUser(userId, { team: teamName });
      
      // 로컬 상태 업데이트
      setSelectedTeams(prev => ({ ...prev, [userId]: teamNumber }));
      
      const user = users.find(u => u.id === userId);
      if (teamNumber) {
        showMessage(`${user?.displayName || '사용자'}를 ${teamNumber}팀으로 배정했습니다.`, 'success');
      } else {
        showMessage(`${user?.displayName || '사용자'}의 팀 배정을 해제했습니다.`, 'success');
      }
      
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
      <div className="p-6">
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

      <div className="max-w-6xl mx-auto">
        {/* 사용자 관리 제목 + 검색창 한 줄 정렬 */}
            <div className="flex justify-between items-center mb-3">
            {/* 왼쪽 - 제목 */}
            <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-1">밀고톡 러너 관리</h2>
            </div>

            {/* 오른쪽 - 검색창 */}
            <div className="w-full max-w-md">
                <div className="relative">
                <input
                    type="text"
                    placeholder="사용자 이름으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-12 bg-white border-2 border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all duration-200"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                </div>
            </div>
        </div>


        {/* 사용자 목록 */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 text-lg">
                  {searchTerm ? '검색 결과가 없습니다.' : '등록된 사용자가 없습니다.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredUsers.map((user, index) => (
                  <div 
                    key={user.id} 
                    className={`p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      {/* 왼쪽: 사용자 정보 */}
                      <div className="flex-1 pr-6">
                        <div className="flex items-center mb-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                            {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-gray-800">
                              {user.displayName || user.email}
                            </h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6 mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold text-yellow-600">
                              {(user.gold || 0).toLocaleString()}
                            </span>
                            <span className="text-gray-500">골드</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              user.team === '1팀' 
                                ? 'bg-blue-100 text-blue-700 border-2 border-blue-200' 
                                : user.team === '2팀'
                                ? 'bg-red-100 text-red-700 border-2 border-red-200'
                                : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                            }`}>
                              {user.team || '팀 없음'}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              getUserInjuries(user.id) >= 4
                                ? 'bg-red-100 text-red-700 border-2 border-red-200'
                                : getUserInjuries(user.id) >= 2
                                ? 'bg-orange-100 text-orange-700 border-2 border-orange-200'
                                : 'bg-green-100 text-green-700 border-2 border-green-200'
                            }`}>
                              부상 {getUserInjuries(user.id)}/4
                              {getUserInjuries(user.id) >= 4 && ' (탈락)'}
                            </span>
                          </div>
                        </div>

                        {/* 팀 배정 버튼 */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            🏆 팀 배정
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleTeamUpdate(user.id, 1)}
                              disabled={updateLoading[user.id]}
                              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                                user.team === '1팀'
                                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-200'
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-2 border-blue-200'
                              } disabled:opacity-50 disabled:transform-none`}
                            >
                              1팀
                            </button>
                            <button
                              onClick={() => handleTeamUpdate(user.id, 2)}
                              disabled={updateLoading[user.id]}
                              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                                user.team === '2팀'
                                  ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200 border-2 border-red-200'
                              } disabled:opacity-50 disabled:transform-none`}
                            >
                              2팀
                            </button>
                            <button
                              onClick={() => handleTeamUpdate(user.id, null)}
                              disabled={updateLoading[user.id]}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 border-2 border-gray-200 disabled:opacity-50 disabled:transform-none"
                            >
                              팀 해제
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 중앙: 보유 아이템 */}
                      <div className="flex-1 px-4">
                        <UserInventoryDisplay userId={user.id} loadUserInventory={loadUserInventory} userInventories={userInventories} />
                      </div>

                      {/* 오른쪽: 골드 조정 */}
                      <div className="flex-shrink-0 w-80">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          💎 골드 조정
                        </label>
                        <div className="bg-gradient-to-r from-green-50 to-yellow-50 p-4 rounded-2xl border-2 border-green-100">
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <button
                              onClick={() => handleGoldUpdate(user.id, user.gold || 0, 100, "add")}
                              disabled={updateLoading[user.id]}
                              className="px-3 py-2 bg-green-500 text-white text-sm rounded-xl hover:bg-green-600 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-green-200 font-semibold disabled:opacity-50 disabled:transform-none"
                            >
                              +100
                            </button>
                            <button
                              onClick={() => handleGoldUpdate(user.id, user.gold || 0, 500, "add")}
                              disabled={updateLoading[user.id]}
                              className="px-3 py-2 bg-green-500 text-white text-sm rounded-xl hover:bg-green-600 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-green-200 font-semibold disabled:opacity-50 disabled:transform-none"
                            >
                              +500
                            </button>
                            <button
                              onClick={() => handleGoldUpdate(user.id, user.gold || 0, 1000, "add")}
                              disabled={updateLoading[user.id]}
                              className="px-3 py-2 bg-green-500 text-white text-sm rounded-xl hover:bg-green-600 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-green-200 font-semibold disabled:opacity-50 disabled:transform-none"
                            >
                              +1000
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleGoldUpdate(user.id, user.gold || 0, 100, "subtract")}
                              disabled={updateLoading[user.id]}
                              className="px-3 py-2 bg-red-500 text-white text-sm rounded-xl hover:bg-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-red-200 font-semibold disabled:opacity-50 disabled:transform-none"
                            >
                              -100
                            </button>
                            <button
                              onClick={() => handleGoldUpdate(user.id, user.gold || 0, 0, "set")}
                              disabled={updateLoading[user.id]}
                              className="px-3 py-2 bg-gray-500 text-white text-sm rounded-xl hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-gray-200 font-semibold disabled:opacity-50 disabled:transform-none"
                            >
                              초기화
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 로딩 표시 */}
                    {updateLoading[user.id] && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-xl border-2 border-blue-100">
                        <div className="text-sm text-blue-600 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                          <span className="font-semibold">업데이트 중...</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;