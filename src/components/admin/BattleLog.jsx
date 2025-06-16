import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Calendar, User, Target, RefreshCw } from 'lucide-react';
import { useBattleLog } from '../../contexts/BattleLogContext';

const BattleLog = () => {
  const { logs, loading, fetchBattleLogs, getTypeStyle, exportLogs } = useBattleLog();
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    sourceUserId: '',
    targetUserId: '',
    dateFrom: '',
    dateTo: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // 초기 데이터 로드
  useEffect(() => {
    fetchBattleLogs();
  }, []);

  // 필터링 로직
  useEffect(() => {
    let filtered = logs;

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.sourceUser?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.targetUser?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.typeName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  }, [searchTerm, logs]);

  // 필터 적용
  const applyFilters = () => {
    fetchBattleLogs(filters);
  };

  // 새로고침
  const handleRefresh = () => {
    fetchBattleLogs(filters);
  };

  // 타입별 색상과 이모지 (Context에서 가져오기)
  const getTypeStyleLocal = (type) => {
    return getTypeStyle(type);
  };

  // 페이지네이션
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  // 필터 초기화
  const resetFilters = () => {
    setFilters({
      type: 'all',
      sourceUserId: '',
      targetUserId: '',
      dateFrom: '',
      dateTo: ''
    });
    setSearchTerm('');
    fetchBattleLogs(); // 필터 없이 다시 로드
  };

  // 내보내기
  const handleExport = () => {
    exportLogs(filteredLogs);
  };

  if (loading && logs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          전투 로그 로딩 중...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            📋 전투 로그
          </h2>
        {/* 불필요 기능 
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              내보내기
            </button>
          </div> */}
          {/* 필터 적용 버튼 */}
          <div className="flex justify-end">
            <button
              onClick={applyFilters}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? '로딩...' : '필터 적용'}
            </button>
          </div>
        </div>

        {/* 필터 영역 */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">필터</span>
            <button 
              onClick={resetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 ml-auto"
            >
              필터 초기화
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 유형 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">유형</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="attack">공격</option>
                <option value="team_attack">팀 공격</option>
                <option value="heal">치료</option>
                <option value="special_heal">특수 치료</option>
              </select>
            </div>

            {/* 사용자 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">사용자</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.sourceUserId}
                  onChange={(e) => setFilters({...filters, sourceUserId: e.target.value})}
                  placeholder="사용자명 입력"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 대상자 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">대상자</label>
              <div className="relative">
                <Target className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.targetUserId}
                  onChange={(e) => setFilters({...filters, targetUserId: e.target.value})}
                  placeholder="대상자명 입력"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 검색 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">검색</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="전체 검색"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* 결과 개수 */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            총 {filteredLogs.length}개의 로그 ({currentPage}/{totalPages} 페이지)
          </p>
        </div>

        {/* 로그 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">유형</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">사용자</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">대상자</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">결과</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">시간</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-500">
                    {loading ? (
                      <div>
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                        로그를 불러오는 중...
                      </div>
                    ) : (
                      '조건에 맞는 로그가 없습니다.'
                    )}
                  </td>
                </tr>
              ) : (
                currentLogs.map((log) => {
                  const typeStyle = getTypeStyleLocal(log.type);
                  return (
                    <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${typeStyle.color}`}>
                          <span>{typeStyle.emoji}</span>
                          {log.typeName}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {log.sourceUser?.displayName || '시스템'}
                          </div>
                          {log.sourceUser?.email && (
                            <div className="text-sm text-gray-500">{log.sourceUser.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {log.targetUser?.displayName || '시스템'}
                          </div>
                          {log.targetUser?.email && (
                            <div className="text-sm text-gray-500">{log.targetUser.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-700">
                          {log.message}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">{log.timestamp}</div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              이전
            </button>
            
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 2 && page <= currentPage + 2)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 border rounded-lg text-sm ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === currentPage - 3 ||
                page === currentPage + 3
              ) {
                return <span key={page} className="px-2">...</span>;
              }
              return null;
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleLog;