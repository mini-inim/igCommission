// components/battle/BattleStatus.jsx
import React, { useState } from 'react';
import { useBattle } from '../../contexts/BattleContext';

const BattleStatus = () => {
  const { battleUsers, teams, loading } = useBattle();
  const [activeTab, setActiveTab] = useState('battle'); // 'battle' 또는 'teams'

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center text-gray-500">배틀 현황 로딩 중...</div>
      </div>
    );
  }

  // 방법 2: includes() 사용 (더 깔끔함)
  const excludeEmails = ['admin@test.com', 'watcher@crepe.com'];
  const filteredUsers = battleUsers.filter(user => 
    !excludeEmails.includes(user.email)
  );
  
  const teamGroups = filteredUsers.reduce((groups, user) => {
    const team = user.team || '무소속';
    if (!groups[team]) {
      groups[team] = [];
    }
    groups[team].push(user);
    return groups;
  }, {});

  // 팀 데이터에서 색상과 이모지 가져오기
  const getTeamColor = (teamName) => {
    const team = teams.find(t => t.name === teamName);
    return team?.color || '#6b7280';
  };

  const getTeamEmoji = (teamName) => {
    if (teamName === '무소속') return '🏃‍♂️';
    
    const team = teams.find(t => t.name === teamName);
    if (!team) return '⚪';
    
    // 색상에 따른 이모지 매핑
    const colorEmojiMap = {
      '#dc2626': '🔴', // 빨강
      '#2563eb': '🔵', // 파랑
      '#059669': '🟢', // 초록
      '#7c3aed': '🟣', // 보라
      '#ea580c': '🟠', // 주황
      '#db2777': '🟤', // 분홍 (갈색으로 대체)
      '#0891b2': '🔷', // 청록
      '#ca8a04': '🟡', // 노랑
    };
    
    return colorEmojiMap[team.color] || '⚪';
  };

  // 팀 순서 정렬 (등록된 팀들 먼저, 마지막에 무소속)
  const sortedTeams = Object.entries(teamGroups).sort(([teamA], [teamB]) => {
    if (teamA === '무소속') return 1;
    if (teamB === '무소속') return -1;
    
    // 팀 등록 순서대로 정렬 (teams 배열의 순서)
    const teamAIndex = teams.findIndex(t => t.name === teamA);
    const teamBIndex = teams.findIndex(t => t.name === teamB);
    
    if (teamAIndex === -1 && teamBIndex === -1) return teamA.localeCompare(teamB);
    if (teamAIndex === -1) return 1;
    if (teamBIndex === -1) return -1;
    
    return teamAIndex - teamBIndex;
  });

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

  // 팀별 생존자 수 계산
  const getTeamStats = (members) => {
    const survivors = members.filter(user => !user.isEliminated).length;
    const eliminated = members.filter(user => user.isEliminated).length;
    return { survivors, eliminated, total: members.length };
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">배틀 현황</h3>
      
      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('battle')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'battle'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            ⚔️ 배틀 현황
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'teams'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            🏆 팀별 상세 현황
          </button>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="p-6">
          {activeTab === 'battle' ? (
            // 배틀 현황 탭
            <div className="space-y-6">
              {/* 전체 통계 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredUsers.length}
                  </div>
                  <div className="text-sm text-blue-600">전체 참가자</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredUsers.filter(u => !u.isEliminated).length}
                  </div>
                  <div className="text-sm text-green-600">생존자</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {filteredUsers.filter(u => u.isEliminated).length}
                  </div>
                  <div className="text-sm text-red-600">탈락자</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {teams.length}
                  </div>
                  <div className="text-sm text-purple-600">등록 팀</div>
                </div>
              </div>

              {/* 팀별 사용자 목록 */}
              {sortedTeams.map(([teamName, members]) => {
                const stats = getTeamStats(members);
                const teamColor = getTeamColor(teamName);
                
                return (
                  <div key={teamName} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-800 flex items-center">
                        <span className="mr-2">{getTeamEmoji(teamName)}</span>
                        <span style={{ color: teamName !== '무소속' ? teamColor : '#6b7280' }}>
                          {teamName}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          ({stats.total}명)
                        </span>
                      </h4>
                      
                      {/* 팀별 간단 통계 */}
                      {teamName !== '무소속' && (
                        <div className="flex items-center space-x-3 text-sm">
                          <span className="text-green-600 font-medium">
                            생존 {stats.survivors}명
                          </span>
                          {stats.eliminated > 0 && (
                            <span className="text-red-600 font-medium">
                              탈락 {stats.eliminated}명
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* 사용자 목록 */}
                    <div className={`${
                      members.length >= 6 
                        ? 'max-h-48 overflow-y-auto' 
                        : ''
                    }`}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {members.map((user) => (
                          <div 
                            key={user.id} 
                            className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                              user.isEliminated 
                                ? 'border-red-300 bg-red-50' 
                                : 'border-gray-200 bg-gray-50 hover:shadow-sm'
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
                  </div>
                );
              })}
            </div>
          ) : (
            // 팀별 상세 현황 탭
            <div className="space-y-6">
              {/* 팀별 상세 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teams.map((team) => {
                  const teamMembers = filteredUsers.filter(user => user.team === team.name);
                  const teamStats = getTeamStats(teamMembers);
                  const survivalRate = teamStats.total > 0 ? ((teamStats.survivors / teamStats.total) * 100).toFixed(1) : 0;
                  
                  return (
                    <div key={team.id} className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border-2 border-gray-200 hover:shadow-lg transition-all duration-200">
                      {/* 팀 헤더 */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getTeamEmoji(team.name)}</span>
                          <div>
                            <h5 className="text-xl font-bold" style={{ color: team.color }}>
                              {team.name}
                            </h5>
                            <p className="text-sm text-gray-500">
                              {teamStats.total}명 · 생존율 {survivalRate}%
                            </p>
                          </div>
                        </div>
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-gray-300"
                          style={{ backgroundColor: team.color }}
                        />
                      </div>

                      {/* 팀 통계 */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center p-3 bg-white rounded-lg">
                          <div className="text-lg font-bold text-gray-800">
                            {teamStats.total}
                          </div>
                          <div className="text-xs text-gray-500">전체</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">
                            {teamStats.survivors}
                          </div>
                          <div className="text-xs text-green-600">생존</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <div className="text-lg font-bold text-red-600">
                            {teamStats.eliminated}
                          </div>
                          <div className="text-xs text-red-600">탈락</div>
                        </div>
                      </div>

                      {/* 팀원 목록 */}
                      {teamMembers.length > 0 ? (
                        <div>
                          <h6 className="text-sm font-semibold text-gray-700 mb-2">팀원 목록</h6>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {teamMembers.map((user) => (
                              <div 
                                key={user.id} 
                                className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                                  user.isEliminated 
                                    ? 'bg-red-100 text-red-700' 
                                    : 'bg-white text-gray-700'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <span>{getInjuryEmoji(user.injuries)}</span>
                                  <span className={user.isEliminated ? 'line-through' : ''}>
                                    {user.displayName}
                                  </span>
                                </div>
                                <span className="text-xs">
                                  부상 {user.injuries}
                                  {user.isEliminated && ' (탈락)'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <p className="text-sm">배정된 팀원이 없습니다</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 무소속 사용자 */}
              {teamGroups['무소속'] && teamGroups['무소속'].length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <h5 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    🏃‍♂️ 무소속 ({teamGroups['무소속'].length}명)
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {teamGroups['무소속'].map((user) => (
                      <div 
                        key={user.id}
                        className={`p-2 rounded-lg text-sm text-center ${
                          user.isEliminated 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-white text-gray-700'
                        }`}
                      >
                        <div>{getInjuryEmoji(user.injuries)}</div>
                        <div className={user.isEliminated ? 'line-through' : ''}>
                          {user.displayName}
                        </div>
                        <div className="text-xs text-gray-500">
                          부상 {user.injuries}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BattleStatus;