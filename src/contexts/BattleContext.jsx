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
  runTransaction,
  increment,
  addDoc,
  deleteDoc
} from "firebase/firestore";

const BattleContext = createContext(null);
export const useBattle = () => useContext(BattleContext);

export const BattleProvider = ({ children }) => {
  const [battleUsers, setBattleUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // 팀 데이터 로드
  const fetchTeams = async () => {
    try {
      const teamsCol = collection(db, "teams");
      const teamsSnap = await getDocs(teamsCol);
      
      if (teamsSnap.empty) {
        // 기본 팀 생성
        const defaultTeams = [
          { name: '레드팀', color: '#dc2626', members: 0 },
          { name: '블루팀', color: '#2563eb', members: 0 }
        ];
        
        for (const team of defaultTeams) {
          await addDoc(teamsCol, team);
        }
        
        // 다시 로드
        const newTeamsSnap = await getDocs(teamsCol);
        const teamsData = newTeamsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTeams(teamsData);
      } else {
        const teamsData = teamsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTeams(teamsData);
      }
    } catch (error) {
      console.error("팀 데이터 로드 실패:", error);
    }
  };

  // 배틀 사용자 정보 로드
  useEffect(() => {
    const fetchBattleUsers = async () => {
      try {
        setLoading(true);
        
        // 팀 데이터 먼저 로드
        await fetchTeams();
        
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
        
        // 팀별 멤버 수 업데이트
        updateTeamMemberCounts(users);
      } catch (error) {
        console.error("배틀 사용자 데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBattleUsers();
  }, []);

  // 팀별 멤버 수 업데이트
  const updateTeamMemberCounts = (users = battleUsers) => {
    setTeams(prev => 
      prev.map(team => ({
        ...team,
        members: users.filter(user => user.team === team.name).length
      }))
    );
  };

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

  // 방어권 체크 및 소모 함수
  const checkAndConsumeDefense = async (userId) => {
    try {
      const inventoryRef = collection(db, 'users', userId, 'inventory');
      const inventorySnap = await getDocs(inventoryRef);
      
      // 방어권 찾기
      const defenseItem = inventorySnap.docs.find(doc => {
        const data = doc.data();
        return data.itemName === '방어권' && (data.quantity || 0) > 0;
      });
      
      if (defenseItem) {
        // 방어권이 있으면 소모
        const itemRef = doc(db, 'users', userId, 'inventory', defenseItem.id);
        const currentQuantity = defenseItem.data().quantity || 0;
        
        await runTransaction(db, async (transaction) => {
          // 읽기 작업 먼저 수행
          const itemDoc = await transaction.get(itemRef);
          
          if (!itemDoc.exists()) {
            return; // 아이템이 없으면 그냥 반환
          }
          
          const quantity = itemDoc.data().quantity || 0;
          
          // 쓰기 작업은 읽기 후에 수행
          if (quantity <= 1) {
            transaction.delete(itemRef);
          } else {
            transaction.update(itemRef, {
              quantity: increment(-1)
            });
          }
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('방어권 체크 실패:', error);
      return false;
    }
  };

  // 탈락하지 않은 사용자 조회
  const getActiveBattleUsers = () => {
    return battleUsers.filter(user => !user.isEliminated);
  };

  // ===== 팀 관리 함수들 =====
  
  // 팀 추가
  const addTeam = async (teamData) => {
    try {
      const teamsCol = collection(db, "teams");
      const docRef = await addDoc(teamsCol, {
        name: teamData.name.trim(),
        color: teamData.color,
        members: 0
      });
      
      const newTeam = {
        id: docRef.id,
        name: teamData.name.trim(),
        color: teamData.color,
        members: 0
      };
      
      setTeams(prev => [...prev, newTeam]);
      return newTeam;
    } catch (error) {
      console.error("팀 추가 실패:", error);
      throw error;
    }
  };

  // 팀 수정
  const updateTeam = async (teamId, updatedData) => {
    try {
      const teamRef = doc(db, "teams", teamId);
      await updateDoc(teamRef, {
        name: updatedData.name.trim(),
        color: updatedData.color
      });
      
      setTeams(prev => 
        prev.map(team => 
          team.id === teamId 
            ? { ...team, ...updatedData, name: updatedData.name.trim() }
            : team
        )
      );
    } catch (error) {
      console.error("팀 수정 실패:", error);
      throw error;
    }
  };

  // 팀 삭제
  const deleteTeam = async (teamId) => {
    try {
      const teamRef = doc(db, "teams", teamId);
      await deleteDoc(teamRef);
      
      setTeams(prev => prev.filter(team => team.id !== teamId));
    } catch (error) {
      console.error("팀 삭제 실패:", error);
      throw error;
    }
  };

  // 팀 멤버 수 업데이트 (개별)
  const updateTeamMemberCount = (teamName, increment = true) => {
    setTeams(prev => 
      prev.map(team => 
        team.name === teamName 
          ? { ...team, members: Math.max(0, team.members + (increment ? 1 : -1)) }
          : team
      )
    );
  };

  // ID로 팀 찾기
  const getTeamById = (teamId) => {
    return teams.find(team => team.id === teamId);
  };

  // 이름으로 팀 찾기
  const getTeamByName = (teamName) => {
    return teams.find(team => team.name === teamName);
  };

  const value = {
    // 기존 배틀 관련
    battleUsers,
    loading,
    updateInjuries,
    updateTeamInjuries,
    getBattleUserById,
    getUsersByTeam,
    getActiveBattleUsers,
    checkAndConsumeDefense,
    
    // 새로 추가된 팀 관리 관련
    teams,
    addTeam,
    updateTeam,
    deleteTeam,
    updateTeamMemberCount,
    updateTeamMemberCounts,
    getTeamById,
    getTeamByName
  };

  return (
    <BattleContext.Provider value={value}>
      {children}
    </BattleContext.Provider>
  );
};