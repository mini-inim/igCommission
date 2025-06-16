// components/gambling/CoinFlip.jsx
import React, { useState } from 'react';
import { useUsers } from '../../contexts/UserContext';
import { db } from "../../firebase";
import { doc, runTransaction, increment } from "firebase/firestore";

const CoinFlip = ({ user, userGold, remainingPlays, onPlay }) => {
  const { updateUser } = useUsers();
  const [bet, setBet] = useState(100);
  const [choice, setChoice] = useState('앞면'); // '앞면' 또는 '뒷면'
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  // 메시지 표시 함수
  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleFlip = async () => {
    if (!user || remainingPlays <= 0) {
      showMessage('게임 횟수가 부족합니다.', 'error');
      return;
    }

    if (bet > userGold) {
      showMessage('골드가 부족합니다.', 'error');
      return;
    }

    if (bet <= 0) {
      showMessage('베팅 금액을 입력해주세요.', 'error');
      return;
    }

    setIsFlipping(true);
    setResult(null);

    try {
      // 게임 횟수 증가
      const playSuccess = await onPlay();
      if (!playSuccess) {
        showMessage('게임 진행 중 오류가 발생했습니다.', 'error');
        setIsFlipping(false);
        return;
      }

      // 동전 던지기 애니메이션 시뮬레이션
      setTimeout(async () => {
        try {
          const coinResult = Math.random() > 0.5 ? '앞면' : '뒷면';
          const won = choice === coinResult;
          const goldChange = won ? bet : -bet;

          // Firebase 트랜잭션으로 골드 업데이트
          await runTransaction(db, async (transaction) => {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await transaction.get(userRef);
            
            if (!userDoc.exists()) {
              throw new Error('사용자 정보를 찾을 수 없습니다.');
            }

            const userData = userDoc.data();
            const currentGold = userData.gold || 0;

            // 패배 시 골드 부족 체크 (이론적으로는 이미 체크했지만 안전을 위해)
            if (!won && currentGold < bet) {
              throw new Error('골드가 부족합니다.');
            }

            // 최종 골드가 0 이하가 되지 않도록 보정
            const finalGold = Math.max(0, currentGold + goldChange);
            
            transaction.update(userRef, {
              gold: finalGold
            });
          });

          // UserContext 업데이트 (0 이하면 0으로 설정)
          const newGold = Math.max(0, userGold + goldChange);
          await updateUser(user.uid, { gold: newGold });

          setResult({
            coinResult,
            won,
            goldChange: Math.abs(goldChange),
            newGold
          });

          if (won) {
            showMessage(`🎉 승리! ${goldChange}골드를 획득했습니다!`, 'success');
          } else {
            showMessage(`😢 패배! ${Math.abs(goldChange)}골드를 잃었습니다.`, 'error');
          }

        } catch (error) {
          console.error('동전 던지기 오류:', error);
          showMessage(error.message || '게임 중 오류가 발생했습니다.', 'error');
        } finally {
          setIsFlipping(false);
        }
      }, 2000);

    } catch (error) {
      console.error('게임 시작 오류:', error);
      showMessage('게임을 시작할 수 없습니다.', 'error');
      setIsFlipping(false);
    }
  };

  // 메시지 스타일
  const getMessageStyle = (type) => {
    const baseStyle = "fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300";
    switch (type) {
      case 'success':
        return `${baseStyle} bg-green-500 text-white`;
      case 'error':
        return `${baseStyle} bg-red-500 text-white`;
      default:
        return `${baseStyle} bg-blue-500 text-white`;
    }
  };

  return (
    <div className="text-center">
      {/* 결과 모달 */}
      {result && !isFlipping && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
            <div className="text-6xl mb-4">
              {result.coinResult === '앞면' ? '😊' : '👑'}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              결과: {result.coinResult}
            </h3>
            <div className={`text-xl font-bold mb-6 ${result.won ? 'text-green-400' : 'text-red-400'}`}>
              {result.won ? `🎉 승리! +${result.goldChange} 골드` : `😢 패배! -${result.goldChange} 골드`}
            </div>
            <div className="text-lg text-gray-300 mb-6">
              현재 골드: {result.newGold.toLocaleString()}
            </div>
            <button
              onClick={() => setResult(null)}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}

      <h3 className="text-3xl font-bold text-white mb-8">🪙 동전 던지기</h3>

      {/* 동전 애니메이션 */}
      <div className="mb-8">
        <div 
          className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-6xl shadow-2xl ${
            isFlipping ? 'animate-spin' : ''
          }`}
        >
          {isFlipping ? '🪙' : '🪙'}
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        {/* 선택 */}
        <div>
          <label className="block text-white font-medium mb-3">선택하세요</label>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setChoice('앞면')}
              disabled={isFlipping}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                choice === '앞면'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } disabled:opacity-50`}
            >
              😊 앞면
            </button>
            <button
              onClick={() => setChoice('뒷면')}
              disabled={isFlipping}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                choice === '뒷면'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } disabled:opacity-50`}
            >
              👑 뒷면
            </button>
          </div>
        </div>

        {/* 베팅 금액 */}
        <div>
          <label className="block text-white font-medium mb-2">베팅 금액</label>
          <input
            type="number"
            value={bet}
            onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            min="1"
            max={userGold}
            disabled={isFlipping}
          />
          <div className="mt-2 text-sm text-gray-400">
            승리 시 획득: {bet * 2} 골드
          </div>
        </div>

        {/* 게임 버튼 */}
        <button
          onClick={handleFlip}
          disabled={isFlipping || bet > userGold || remainingPlays <= 0 || bet <= 0}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isFlipping ? '동전 던지는 중...' : '동전 던지기!'}
        </button>
      </div>

      {/* 게임 규칙 */}
      <div className="mt-8 p-4 bg-gray-700 rounded-lg">
        <h4 className="text-white font-bold mb-2">게임 규칙</h4>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• 앞면 또는 뒷면을 선택하세요</li>
          <li>• 맞추면 베팅 금액의 2배를 획득합니다</li>
          <li>• 틀리면 베팅 금액을 잃습니다</li>
          <li>• 하루에 최대 5번까지 플레이 가능합니다</li>
        </ul>
      </div>
    </div>
  );
};

export default CoinFlip;