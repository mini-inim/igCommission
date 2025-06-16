// components/battle/BattleStatus.jsx
import React from 'react';
import { useBattle } from '../../contexts/BattleContext';

const BattleStatus = () => {
  const { battleUsers, loading } = useBattle();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center text-gray-500">배틀 현황 로딩 중...</div>
      </div>
    );
  }

  // 팀별 그룹화
  const teamGroups = battleUsers.reduce((groups, user) => {
    const team = user.team || '무소속';
    if (!groups[team]) {
      groups[team] = [];
    }
    groups[team].push(user);
    return groups;
  }, {});

  const getInjuryColor = (injuries) => {
    if (injuries >= 4) return 'text-red-600 bg-red-100';
    if (injuries >= 3) return 'text-orange-600 bg-orange-100';
    if (injuries >= 2) return 'text-yellow-600 bg-yellow-100';
    if (injuries >= 1) return 'text-blue-600 bg-blue-100';
    return 'text-green-600 bg-green-100';
  };

  const getInjuryEmoji = (injuries) => {
    if (injuries >= 4) return '💀';
    if (injuries >= 3) return '🤕';
    if (injuries >= 2) return '😵';
    if (injuries >= 1) return '😣';
    return '😊';
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">배틀 현황</h3>
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="space-y-6">
          {Object.entries(teamGroups).map(([teamName, members]) => (
            <div key={teamName} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
              <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                {teamName === '무소속' ? '🏃‍♂️' : '👥'} {teamName}
                <span className="ml-2 text-sm text-gray-500">
                  ({members.length}명)
                </span>
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {members.map((user) => (
                  <div 
                    key={user.id} 
                    className={`p-3 rounded-lg border-2 ${
                      user.isEliminated 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {getInjuryEmoji(user.injuries)}
                        </span>
                        <div>
                          <div className={`font-medium ${
                            user.isEliminated ? 'text-gray-500 line-through' : 'text-gray-800'
                          }`}>
                            {user.displayName}
                          </div>
                          {user.isEliminated && (
                            <div className="text-xs text-red-600 font-bold">
                              탈락
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-bold ${getInjuryColor(user.injuries)}`}>
                        부상 {user.injuries}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 전체 통계 */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {battleUsers.length}
              </div>
              <div className="text-sm text-blue-600">전체 참가자</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {battleUsers.filter(u => !u.isEliminated).length}
              </div>
              <div className="text-sm text-green-600">생존자</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {battleUsers.filter(u => u.isEliminated).length}
              </div>
              <div className="text-sm text-red-600">탈락자</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(teamGroups).length}
              </div>
              <div className="text-sm text-purple-600">참여 팀</div>
            </div>
          </div>
        </div>

        {/* 부상 레벨 안내 */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h5 className="text-sm font-bold text-gray-700 mb-2">부상 상태 안내</h5>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <span>😊</span>
              <span className="text-green-600">건강 (0)</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>😣</span>
              <span className="text-blue-600">경상 (1)</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>😵</span>
              <span className="text-yellow-600">중상 (2)</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>🤕</span>
              <span className="text-orange-600">중증 (3)</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>💀</span>
              <span className="text-red-600">탈락 (4+)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleStatus;