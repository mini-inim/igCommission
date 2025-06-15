// src/contexts/ItemContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase"; // firebase.js에서 import
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const ItemContext = createContext(null);
export const useItems = () => useContext(ItemContext);

export const ItemProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const itemsCol = collection(db, "items");

  // 1) 초기 데이터 로드
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const snap = await getDocs(itemsCol);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(data);
      } catch (error) {
        console.error("아이템 데이터 로드 실패:", error);
      }
    };
    fetchItems();
  }, []);

  // 2) 아이템 추가
  const addItem = async ({ name, price, image }) => {
    try {
      const ref = await addDoc(itemsCol, { name, price, image });
      setItems(prev => [...prev, { id: ref.id, name, price, image }]);
    } catch (error) {
      console.error("아이템 추가 실패:", error);
      throw error;
    }
  };

  // 3) 아이템 업데이트
  const updateItem = async (id, updates) => {
    try {
      const docRef = doc(db, "items", id);
      await updateDoc(docRef, updates);
      setItems(prev =>
        prev.map(item => (item.id === id ? { ...item, ...updates } : item))
      );
    } catch (error) {
      console.error("아이템 업데이트 실패:", error);
      throw error;
    }
  };

  // 4) 아이템 삭제
  const removeItem = async id => {
    try {
      const docRef = doc(db, "items", id);
      await deleteDoc(docRef);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error("아이템 삭제 실패:", error);
      throw error;
    }
  };

  return (
    <ItemContext.Provider
      value={{ items, addItem, updateItem, removeItem }}
    >
      {children}
    </ItemContext.Provider>
  );
};