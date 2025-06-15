// src/contexts/UserContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase"; // 또는 경로에 맞게 조정
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";

const UserContext = createContext(null);
export const useUsers = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const usersCol = collection(db, "users");

  // 1) 초기 데이터 로드
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // 이름 순으로 정렬해서 가져오기 (이름이 없으면 email 순)
        const snap = await getDocs(usersCol);
        const data = snap.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          gold: doc.data().gold || 0 // 기본값 설정
        }));
        
        // 클라이언트에서 정렬 (name이나 email 기준)
        data.sort((a, b) => {
          const nameA = a.name || a.email || '';
          const nameB = b.name || b.email || '';
          return nameA.localeCompare(nameB);
        });
        
        setUsers(data);
      } catch (error) {
        console.error("사용자 데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // 2) 사용자 정보 업데이트 (주로 골드용)
  const updateUser = async (userId, updates) => {
    try {
      const docRef = doc(db, "users", userId);
      await updateDoc(docRef, updates);
      
      // 로컬 상태 업데이트
      setUsers(prev =>
        prev.map(user => (user.id === userId ? { ...user, ...updates } : user))
      );
    } catch (error) {
      console.error("사용자 업데이트 실패:", error);
      throw error;
    }
  };

  // 3) 특정 사용자 찾기
  const getUserById = (userId) => {
    return users.find(user => user.id === userId);
  };

  // 4) 골드 랭킹 (상위 사용자들)
  const getTopGoldUsers = (limit = 10) => {
    return [...users]
      .sort((a, b) => (b.gold || 0) - (a.gold || 0))
      .slice(0, limit);
  };

  const value = {
    users,
    loading,
    updateUser,
    getUserById,
    getTopGoldUsers,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};