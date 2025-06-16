// components/GamblingPage.jsx
import React, { useState, useEffect } from 'react';
import Navigation from './common/Navigation';
import CoinFlip from './gamble/CoinFlip';
import Roulette from './gamble/Roulette';
import { useUsers } from '../contexts/UserContext';
import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const GamblingPage = ({ user }) => {
  const { getUserById } = useUsers();
  const [activeGame, setActiveGame] = useState('coin'); // 'coin' 또는 'roulette'
  const [dailyPlays, setDailyPlays] = useState(0);
  const [lastPlayDate, setLastPlayDate] = useState(null);
  const [loading, setLoading] = useState(true);

  // 현재 사용자 정보
  const currentUser = getUserById(user?.uid);
  const userGold = currentUser?.gold || 0;

  // 오늘 날짜 문자열 (YYYY-MM-DD)
  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  // 일일 플레이 횟수 확인
  useEffect(() => {
    const fetchDailyPlays = async () => {
      if (!user) return;

      try {
        const today = getTodayString();
        const userGamblingRef = doc(db, 'users', user.uid, 'gambling', today);
        const gamblingDoc = await getDoc(userGamblingRef);

        if (gamblingDoc.exists()) {
          const data = gamblingDoc.data();
          setDailyPlays(data.plays || 0);
          setLastPlayDate(data.date);
        } else {
          setDailyPlays(0);
          setLastPlayDate(null);
        }
      } catch (error) {
        console.error('일일 플레이 횟수 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyPlays();
  }, [user]);

  // 플레이 횟수 증가
  const incrementDailyPlays = async () => {
    if (!user || dailyPlays >= 5) return false;

    try {
      const today = getTodayString();
      const userGamblingRef = doc(db, 'users', user.uid, 'gambling', today);
      const newPlays = dailyPlays + 1;

      await setDoc(userGamblingRef, {
        plays: newPlays,
        date: today,
        lastUpdated: new Date()
      }, { merge: true });

      setDailyPlays(newPlays);
      return true;
    } catch (error) {
      console.error('플레이 횟수 업데이트 실패:', error);
      return false;
    }
  };

  const remainingPlays = 5 - dailyPlays;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation user={user} />
        <div className="flex items-center justify-center h-96">
          <div className="text-white text-xl">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">🎰 카지노</h2>
          <p className="text-gray-400">운을 시험해보세요!</p>
        </div>

        {/* 사용자 정보 및 제한 */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-yellow-400">💰 {userGold.toLocaleString()}</div>
              <div className="text-gray-400">보유 골드</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{remainingPlays}</div>
              <div className="text-gray-400">남은 게임 횟수</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">5</div>
              <div className="text-gray-400">일일 최대 게임</div>
            </div>
          </div>
          
          {remainingPlays === 0 && (
            <div className="mt-4 p-4 bg-red-600 rounded-lg text-center">
              <p className="text-white font-medium">오늘의 게임 횟수를 모두 사용했습니다. 내일 다시 도전하세요!</p>
            </div>
          )}
        </div>

        {/* 게임 선택 탭 */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-xl p-2 flex space-x-2">
            <button
              onClick={() => setActiveGame('coin')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeGame === 'coin'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              🪙 동전 던지기
            </button>
            <button
              onClick={() => setActiveGame('roulette')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeGame === 'roulette'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              🎰 룰렛
            </button>
          </div>
        </div>

        {/* 게임 컴포넌트 */}
        <div className="bg-gray-800 rounded-2xl p-8">
          {activeGame === 'coin' ? (
            <CoinFlip 
              user={user}
              userGold={userGold}
              remainingPlays={remainingPlays}
              onPlay={incrementDailyPlays}
            />
          ) : (
            <Roulette 
              user={user}
              userGold={userGold}
              remainingPlays={remainingPlays}
              onPlay={incrementDailyPlays}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GamblingPage;