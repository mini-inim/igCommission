// src/contexts/InventoryContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  runTransaction,
  increment,
  deleteDoc
} from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { useItems } from "./ItemContext";

const InventoryContext = createContext(null);
export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
  const { user } = useAuth();
  const { items } = useItems();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // 인벤토리 새로고침 함수
  const refreshInventory = async () => {
    if (!user) {
      setInventory([]);
      return;
    }
    
    try {
      const inventoryRef = collection(db, 'users', user.uid, 'inventory');
      const inventorySnap = await getDocs(inventoryRef);
      
      if (inventorySnap.empty) {
        setInventory([]);
        return;
      }

      const userItems = inventorySnap.docs.map((docSnap) => {
        const data = docSnap.data();
        const contextItem = items.find(item => item.id === data.itemId);

        return {
          id: docSnap.id,
          itemId: data.itemId || docSnap.id,
          itemName: data.itemName || contextItem?.name || "이름 없음",
          quantity: data.quantity || 0,
          ...data
        };
      }).filter(item => item.quantity > 0);
      
      setInventory(userItems);
    } catch (error) {
      console.error('인벤토리 새로고침 실패:', error);
    }
  };

  // 인벤토리 로드
  useEffect(() => {
    const fetchInventory = async () => {
      if (!user) {
        setInventory([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const inventoryRef = collection(db, 'users', user.uid, 'inventory');
        const inventorySnap = await getDocs(inventoryRef);
        
        if (inventorySnap.empty) {
          setInventory([]);
          return;
        }

        const userItems = inventorySnap.docs.map((docSnap) => {
          const data = docSnap.data();
          const contextItem = items.find(item => item.id === data.itemId);

          return {
            id: docSnap.id,
            itemId: data.itemId || docSnap.id,
            itemName: data.itemName || contextItem?.name || "이름 없음",
            quantity: data.quantity || 0,
            ...data
          };
        }).filter(item => item.quantity > 0);
        
        setInventory(userItems);
      } catch (error) {
        console.error('인벤토리 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [user, items]);

  // 인벤토리 아이템 추가/업데이트 (구매 시 사용)
  const addToInventory = (itemId, itemName, quantity = 1) => {
    setInventory(prev => {
      const existingItemIndex = prev.findIndex(item => item.itemId === itemId);
      
      if (existingItemIndex >= 0) {
        // 기존 아이템 수량 증가
        const updatedItems = [...prev];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        return updatedItems;
      } else {
        // 새로운 아이템 추가
        return [...prev, {
          id: itemId,
          itemId: itemId,
          itemName: itemName,
          quantity: quantity
        }];
      }
    });
  };

  // 인벤토리 아이템 제거/감소 (사용/양도 시 사용)
  const removeFromInventory = (itemId, quantity = 1) => {
    setInventory(prev => {
      const existingItemIndex = prev.findIndex(item => item.id === itemId);
      
      if (existingItemIndex >= 0) {
        const updatedItems = [...prev];
        const newQuantity = updatedItems[existingItemIndex].quantity - quantity;
        
        if (newQuantity <= 0) {
          // 수량이 0 이하면 제거
          updatedItems.splice(existingItemIndex, 1);
        } else {
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: newQuantity
          };
        }
        return updatedItems;
      }
      
      return prev;
    });
  };

  // 아이템 사용 (Firebase 트랜잭션 포함)
  const consumeItem = async (itemId) => {
    if (!user) throw new Error('로그인이 필요합니다.');

    try {
      await runTransaction(db, async (transaction) => {
        const itemRef = doc(db, 'users', user.uid, 'inventory', itemId);
        const itemDoc = await transaction.get(itemRef);
        
        if (!itemDoc.exists()) {
          throw new Error('아이템이 존재하지 않습니다.');
        }
        
        const currentQuantity = itemDoc.data().quantity || 0;
        
        if (currentQuantity <= 1) {
          transaction.delete(itemRef);
        } else {
          transaction.update(itemRef, {
            quantity: increment(-1)
          });
        }
      });

      // 로컬 상태 업데이트
      removeFromInventory(itemId, 1);
      
    } catch (error) {
      console.error('아이템 사용 실패:', error);
      throw error;
    }
  };

  // 아이템 양도 (Firebase 트랜잭션 포함)
  const transferItem = async (itemId, targetUserId) => {
    if (!user) throw new Error('로그인이 필요합니다.');
    if (targetUserId === user.uid) throw new Error('자신에게는 양도할 수 없습니다.');

    const itemData = inventory.find(item => item.id === itemId);
    if (!itemData) throw new Error('선택한 아이템을 찾을 수 없습니다.');

    try {
      await runTransaction(db, async (transaction) => {
        // 현재 사용자 인벤토리에서 아이템 차감
        const fromItemRef = doc(db, 'users', user.uid, 'inventory', itemId);
        const fromItemDoc = await transaction.get(fromItemRef);
        
        if (!fromItemDoc.exists()) {
          throw new Error('아이템이 존재하지 않습니다.');
        }
        
        const currentQuantity = fromItemDoc.data().quantity || 0;
        
        if (currentQuantity <= 1) {
          transaction.delete(fromItemRef);
        } else {
          transaction.update(fromItemRef, {
            quantity: increment(-1)
          });
        }

        // 대상 사용자 인벤토리에 아이템 추가
        const toItemRef = doc(db, 'users', targetUserId, 'inventory', itemId);
        const toItemDoc = await transaction.get(toItemRef);
        
        if (toItemDoc.exists()) {
          transaction.update(toItemRef, {
            quantity: increment(1),
            lastReceivedAt: new Date()
          });
        } else {
          transaction.set(toItemRef, {
            ...itemData,
            quantity: 1,
            receivedAt: new Date(),
            lastReceivedAt: new Date(),
            transferredFrom: user.uid
          });
        }
      });

      // 로컬 상태 업데이트
      removeFromInventory(itemId, 1);
      
    } catch (error) {
      console.error('아이템 양도 실패:', error);
      throw error;
    }
  };

  // 특정 아이템 조회
  const getItemById = (itemId) => {
    return inventory.find(item => item.id === itemId);
  };

  // 특정 아이템명으로 조회
  const getItemsByName = (itemName) => {
    return inventory.filter(item => item.itemName === itemName);
  };

  const value = {
    inventory,
    loading,
    addToInventory,
    removeFromInventory,
    consumeItem,
    transferItem,
    getItemById,
    getItemsByName,
    refreshInventory,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};