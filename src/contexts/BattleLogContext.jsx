// src/contexts/BattleLogContext.jsx
import React, { createContext, useContext, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  limit,
  getDoc,
  doc
} from "firebase/firestore";

const BattleLogContext = createContext(null);
export const useBattleLog = () => useContext(BattleLogContext);

export const BattleLogProvider = ({ children }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // 사용자 정보 가져오기 (캐시용)
  const userCache = {};
  const getUserInfo = async (userId) => {
    if (userCache[userId]) {
      return userCache[userId];
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = { id: userId, ...userDoc.data() };
        userCache[userId] = userData;
        return userData;
      }
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
    }

    return { id: userId, displayName: '알 수 없음', email: userId };
  };

  // 배틀 로그 가져오기
  const fetchBattleLogs = async (filters = {}) => {
    try {
      setLoading(true);
      
      const notificationsRef = collection(db, 'notifications');
      
      // 배틀 관련 타입들
      const battleTypes = ['attack', 'special_attack', 'heal', 'special_heal', 'defense', 'team_attack'];
      
      // 기본 쿼리 (배틀 관련 알림만)
      let q = query(
        notificationsRef,
        where('type', 'in', battleTypes),
        orderBy('createdAt', 'desc'),
        limit(filters.limit || 100)
      );

      const snapshot = await getDocs(q);
      
      const rawLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));

      // 사용자 정보 병합
      const logsWithUserInfo = await Promise.all(
        rawLogs.map(async (log) => {
          const sourceUser = log.sourceUserId ? await getUserInfo(log.sourceUserId) : null;
          const targetUser = log.targetUserId ? await getUserInfo(log.targetUserId) : null;

          return {
            ...log,
            sourceUser,
            targetUser,
            typeName: getTypeDisplayName(log.type),
            timestamp: formatTimestamp(log.createdAt)
          };
        })
      );

      // 클라이언트에서 추가 필터링
      let filteredLogs = logsWithUserInfo;

      if (filters.type && filters.type !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.type === filters.type);
      }

      if (filters.sourceUserId) {
        filteredLogs = filteredLogs.filter(log => 
          log.sourceUser?.displayName?.toLowerCase().includes(filters.sourceUserId.toLowerCase()) ||
          log.sourceUser?.email?.toLowerCase().includes(filters.sourceUserId.toLowerCase())
        );
      }

      if (filters.targetUserId) {
        filteredLogs = filteredLogs.filter(log => 
          log.targetUser?.displayName?.toLowerCase().includes(filters.targetUserId.toLowerCase()) ||
          log.targetUser?.email?.toLowerCase().includes(filters.targetUserId.toLowerCase()) ||
          log.message?.toLowerCase().includes(filters.targetUserId.toLowerCase())
        );
      }

      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        filteredLogs = filteredLogs.filter(log => log.createdAt >= fromDate);
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // 해당 날짜 끝까지
        filteredLogs = filteredLogs.filter(log => log.createdAt <= toDate);
      }

      setLogs(filteredLogs);
      return filteredLogs;
    } catch (error) {
      console.error('배틀 로그 가져오기 실패:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 배틀 로그 생성
  const createBattleLog = async (sourceUserId, targetUserId, type, message, additionalData = {}) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        sourceUserId,
        targetUserId,
        type,
        message,
        isRead: false,
        isBattleLog: true,
        createdAt: serverTimestamp(),
        ...additionalData
      });
    } catch (error) {
      console.error('배틀 로그 생성 실패:', error);
      throw error;
    }
  };

  // 타입 표시명 가져오기
  const getTypeDisplayName = (type) => {
    const typeNames = {
      'attack': '공격',
      'special_attack': '특수 공격',
      'heal': '치료',
      'special_heal': '특수 치료',
      'defense': '방어',
      'team_attack': '팀 공격'
    };
    return typeNames[type] || type;
  };

  // 타입별 스타일
  const getTypeStyle = (type) => {
    const styles = {
      'attack': { color: 'text-red-600 bg-red-100', emoji: '⚔️' },
      'special_attack': { color: 'text-red-800 bg-red-200', emoji: '💥' },
      'heal': { color: 'text-green-600 bg-green-100', emoji: '💚' },
      'special_heal': { color: 'text-green-800 bg-green-200', emoji: '✨' },
      'defense': { color: 'text-blue-600 bg-blue-100', emoji: '🛡️' },
      'team_attack': { color: 'text-orange-600 bg-orange-100', emoji: '💥' }
    };
    return styles[type] || { color: 'text-gray-600 bg-gray-100', emoji: '📝' };
  };

  // 시간 포맷팅
  const formatTimestamp = (date) => {
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // 로그 내보내기 (CSV)
  const exportLogs = (logsToExport = logs) => {
    const csvHeader = 'ID,유형,사용자,사용자이메일,대상자,메시지,시간\n';
    const csvContent = logsToExport.map(log => {
      const sourceInfo = log.sourceUser ? `${log.sourceUser.displayName || ''},${log.sourceUser.email || ''}` : ',';
      const targetInfo = log.targetUser ? log.targetUser.displayName || log.targetUser.email || '' : '시스템';
      return `${log.id},${log.typeName},${sourceInfo},${targetInfo},"${log.message}",${log.timestamp}`;
    }).join('\n');

    const csvData = csvHeader + csvContent;
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `battle_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const value = {
    logs,
    loading,
    fetchBattleLogs,
    createBattleLog,
    getTypeDisplayName,
    getTypeStyle,
    formatTimestamp,
    exportLogs
  };

  return (
    <BattleLogContext.Provider value={value}>
      {children}
    </BattleLogContext.Provider>
  );
};