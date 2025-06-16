// src/contexts/NotificationContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  limit
} from "firebase/firestore";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);
export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // 사용자의 알림 실시간 구독
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('targetUserId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50) // 최근 50개만
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));

      setNotifications(notificationList);
      
      // 읽지 않은 알림 개수 계산
      const unread = notificationList.filter(notification => !notification.isRead).length;
      setUnreadCount(unread);
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 알림 생성 함수
  const createNotification = async (targetUserId, type, message, sourceUserId = null) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        targetUserId,
        sourceUserId,
        type, // 'attack', 'heal', 'defense', 'transfer' 등
        message,
        isRead: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('알림 생성 실패:', error);
    }
  };

  // 알림 읽음 처리
  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
        readAt: serverTimestamp()
      });
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      const promises = unreadNotifications.map(notification => 
        markAsRead(notification.id)
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('모든 알림 읽음 처리 실패:', error);
    }
  };

  // 알림 타입별 이모지
  const getNotificationEmoji = (type) => {
    const emojiMap = {
      'attack': '⚔️',
      'heal': '💚',
      'defense': '🛡️',
      'transfer': '📦',
      'team_attack': '💥',
      'special_heal': '✨'
    };
    return emojiMap[type] || '📢';
  };

  // 알림 타입별 색상
  const getNotificationColor = (type) => {
    const colorMap = {
      'attack': 'text-red-600 bg-red-50',
      'heal': 'text-green-600 bg-green-50',
      'defense': 'text-blue-600 bg-blue-50',
      'transfer': 'text-purple-600 bg-purple-50',
      'team_attack': 'text-orange-600 bg-orange-50',
      'special_heal': 'text-emerald-600 bg-emerald-50'
    };
    return colorMap[type] || 'text-gray-600 bg-gray-50';
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    createNotification,
    markAsRead,
    markAllAsRead,
    getNotificationEmoji,
    getNotificationColor,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};