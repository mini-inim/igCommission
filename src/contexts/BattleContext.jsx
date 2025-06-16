// src/contexts/BattleContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  setDoc,
  getDoc,
  runTransaction
} from "firebase/firestore";

const BattleContext = createContext(null);
export const useBattle = () => useContext(BattleContext);

export const BattleProvider = ({ children }) => {
  const [battleUsers, setBattleUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 배틀 사용자 정보 로드
  useEffect(() => {
    const fetchBattleUsers = async () => {
      try {
        setLoading(true);
        const usersCol = collection(db, "users");
        const snap = await getDocs(usersCol);
        
        const users = await Promise.all(
          snap.docs.map(async (userDoc) => {
            const userData = userDoc.data();
            
            // 배틀 정보 조회
            const battleRef = doc(db, 'users', userDoc.id, 'battle', 'status');
            const battleDoc = await getDoc(battleRef);
            
            const battleData = battleDoc.exists() ? battleDoc.data() : {};
            
            return {
              id: userDoc.id,
              displayName: userData.displayName || userData.email,
              email: userData.email,
              team: userData.team || null,
              injuries: battleData.injuries || 0,
              isEliminated: (battleData.injuries || 0) >= 4,
              lastUpdated: battleData.lastUpdated || null
            };
          })
        );
        
        setBattleUsers(users);
      } catch (error) {
        console.error("배틀 사용자 데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBattleUsers();
  }, []);

  // 부상 업데이트
  const updateInjuries = async (userId, injuryChange) => {
    try {
      await runTransaction(db, async (transaction) => {
        const battleRef = doc(db, 'users', userId, 'battle', 'status');
        const battleDoc = await transaction.get(battleRef);
        
        const currentInjuries = battleDoc.exists() ? (battleDoc.data().injuries || 0) : 0;
        const newInjuries = Math.max(0, currentInjuries + injuryChange);
        
        transaction.set(battleRef, {
          injuries: newInjuries,
          isEliminated: newInjuries >= 4,
          lastUpdated: new Date()
        }, { merge: true });
      });

      // 로컬 상태 업데이트
      setBattleUsers(prev =>
        prev.map(user => {
          if (user.id === userId) {
            const newInjuries = Math.max(0, user.injuries + injuryChange);
            return {
              ...user,
              injuries: newInjuries,
              isEliminated: newInjuries >= 4,
              lastUpdated: new Date()
            };
          }
          return user;
        })
      );

      return true;
    } catch (error) {
      console.error("부상 업데이트 실패:", error);
      throw error;
    }
  };

  // 팀 전체 부상 증가
  const updateTeamInjuries = async (teamName, injuryChange) => {
    try {
      const teamMembers = battleUsers.filter(user => user.team === teamName);
      
      await Promise.all(
        teamMembers.map(member => updateInjuries(member.id, injuryChange))
      );

      return teamMembers.length;
    } catch (error) {
      console.error("팀 부상 업데이트 실패:", error);
      throw error;
    }
  };

  // 특정 사용자 정보 조회
  const getBattleUserById = (userId) => {
    return battleUsers.find(user => user.id === userId);
  };

  // 팀별 사용자 조회
  const getUsersByTeam = (teamName) => {
    return battleUsers.filter(user => user.team === teamName);
  };

  // 탈락하지 않은 사용자 조회
  const getActiveBattleUsers = () => {
    return battleUsers.filter(user => !user.isEliminated);
  };

  const value = {
    battleUsers,
    loading,
    updateInjuries,
    updateTeamInjuries,
    getBattleUserById,
    getUsersByTeam,
    getActiveBattleUsers,
  };

  return (
    <BattleContext.Provider value={value}>
      {children}
    </BattleContext.Provider>
  );
};