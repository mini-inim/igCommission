// components/gambling/Roulette.jsx
import React, { useState } from 'react';
import { useUsers } from '../../contexts/UserContext';
import { db } from "../../firebase";
import { doc, runTransaction, increment } from "firebase/firestore";

const Roulette = ({ user, userGold, remainingPlays, onPlay }) => {
  const { updateUser } = useUsers();
  const [bet, setBet] = useState(100);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  // 룰렛 확률 및 배율 설정
  const rouletteOptions = [
    { multiplier: 10, probability: 1, color: 'from-yellow-400 to-yellow-600', emoji: '💎', name: '10배' },
    { multiplier: 5, probability: 3, color: 'from-purple-400 to-purple-600', emoji: '🔮', name: '5배' },
    { multiplier: 2, probability: 10, color: 'from-blue-400 to-blue-600', emoji: '💙', name: '2배' },
    { multiplier: 1, probability: 26, color: 'from-green-400 to-green-600', emoji: '💚', name: '1배' },
    { multiplier: 0, probability: 30, color: 'from-gray-400 to-gray-600', emoji: '😐', name: '0배' },
    { multiplier: -1, probability: 20, color: 'from-orange-400 to-red-500', emoji: '😟', name: '-1배' },
    { multiplier: -2, probability: 10, color: 'from-red-500 to-red-700', emoji: '😱', name: '-2배' }
  ];

  // 메시지 표시 함수
  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  // 확률에 따른 결과 선택
  const getRouletteResult = () => {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const option of rouletteOptions) {
      cumulative += option.probability;
      if (random <= cumulative) {
        return option;
      }
    }
    
    // 안전장치 (이론적으로는 실행되지 않음)
    return rouletteOptions[4]; // 0배 반환
  };

  const handleSpin = async () => {
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

    setIsSpinning(true);
    setResult(null);

    try {
      // 게임 횟수 증가
      const playSuccess = await onPlay();
      if (!playSuccess) {
        showMessage('게임 진행 중 오류가 발생했습니다.', 'error');
        setIsSpinning(false);
        return;
      }

      // 즉시 베팅 금액 차감
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new Error('사용자 정보를 찾을 수 없습니다.');
        }

        const userData = userDoc.data();
        const currentGold = userData.gold || 0;

        if (currentGold < bet) {
          throw new Error('골드가 부족합니다.');
        }

        transaction.update(userRef, {
          gold: increment(-bet)
        });
      });

      // UserContext에서 베팅 금액 차감
      await updateUser(user.uid, { gold: userGold - bet });

      // 룰렛 스핀 애니메이션 시뮬레이션
      setTimeout(async () => {
        try {
          const selectedOption = getRouletteResult();
          const winAmount = bet * selectedOption.multiplier;
          
          let finalGoldChange = winAmount;
          let newGold = userGold - bet; // 이미 차감된 상태

          // 상금이 있는 경우 지급
          if (winAmount > 0) {
            await runTransaction(db, async (transaction) => {
              const userRef = doc(db, 'users', user.uid);
              transaction.update(userRef, {
                gold: increment(winAmount)
              });
            });
            
            newGold += winAmount;
            await updateUser(user.uid, { gold: newGold });
          } else if (winAmount < 0) {
            // 추가 차감이 필요한 경우 (마이너스 배율)
            const additionalLoss = Math.abs(winAmount);
            await runTransaction(db, async (transaction) => {
              const userRef = doc(db, 'users', user.uid);
              const userDoc = await transaction.get(userRef);
              const userData = userDoc.data();
              const currentGold = userData.gold || 0;
              
              // 최종 골드가 0 이하가 되지 않도록 보정
              const finalGold = Math.max(0, currentGold - additionalLoss);
              
              transaction.update(userRef, {
                gold: finalGold
              });
            });
            
            // UserContext 업데이트 (0 이하면 0으로 설정)
            newGold = Math.max(0, newGold - additionalLoss);
            await updateUser(user.uid, { gold: newGold });
          }

          setResult({
            option: selectedOption,
            betAmount: bet,
            winAmount,
            newGold
          });

          // 결과에 따른 메시지
          if (selectedOption.multiplier > 1) {
            showMessage(`🎉 대박! ${selectedOption.name} 당첨! +${winAmount}골드!`, 'success');
          } else if (selectedOption.multiplier === 1) {
            showMessage(`💚 원금 회수! +${winAmount}골드`, 'success');
          } else if (selectedOption.multiplier === 0) {
            showMessage(`😐 꽝! 베팅 금액만 손실`, 'error');
          } else {
            showMessage(`😱 최악! ${selectedOption.name} 추가 손실 -${Math.abs(winAmount)}골드!`, 'error');
          }

        } catch (error) {
          console.error('룰렛 결과 처리 오류:', error);
          showMessage(error.message || '게임 중 오류가 발생했습니다.', 'error');
        } finally {
          setIsSpinning(false);
        }
      }, 3000);

    } catch (error) {
      console.error('룰렛 게임 오류:', error);
      showMessage('게임을 시작할 수 없습니다.', 'error');
      setIsSpinning(false);
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
      {result && !isSpinning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
            <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-r ${result.option.color} flex items-center justify-center text-4xl mb-4 shadow-xl`}>
              {result.option.emoji}
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">
              {result.option.name}
            </h3>
            <div className="text-lg text-gray-300 mb-4">
              베팅: {result.betAmount.toLocaleString()} 골드
            </div>
            
            {result.winAmount > 0 && (
              <div className="text-2xl font-bold text-green-400 mb-4">
                🎉 획득: +{result.winAmount.toLocaleString()} 골드
              </div>
            )}
            {result.winAmount < 0 && (
              <div className="text-2xl font-bold text-red-400 mb-4">
                😱 추가 손실: {Math.abs(result.winAmount).toLocaleString()} 골드
              </div>
            )}
            {result.winAmount === 0 && (
              <div className="text-2xl font-bold text-gray-400 mb-4">
                😐 꽝! 베팅 금액 손실
              </div>
            )}
            
            <div className="text-lg text-gray-300 mb-6">
              현재 골드: {result.newGold.toLocaleString()}
            </div>
            <button
              onClick={() => setResult(null)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}

      <h3 className="text-3xl font-bold text-white mb-8">🎰 운명의 룰렛</h3>

      {/* 룰렛 휠 */}
      <div className="mb-8">
        <div 
          className={`w-40 h-40 mx-auto rounded-full bg-gradient-to-r from-purple-400 to-pink-600 flex items-center justify-center text-6xl shadow-2xl border-8 border-white ${
            isSpinning ? 'animate-spin' : ''
          }`}
          style={{
            animationDuration: isSpinning ? '3s' : '0s',
            animationIterationCount: isSpinning ? 'infinite' : 'initial'
          }}
        >
          {isSpinning ? '🎰' : '🎰'}
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-6">
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
            disabled={isSpinning}
          />
        </div>

        {/* 게임 버튼 */}
        <button
          onClick={handleSpin}
          disabled={isSpinning || bet > userGold || remainingPlays <= 0 || bet <= 0}
          className="w-full py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSpinning ? '룰렛 돌리는 중...' : '룰렛 돌리기!'}
        </button>

        <div className="text-sm text-yellow-400 font-medium">
          ⚠️ 베팅 금액은 즉시 차감됩니다
        </div>
      </div>

      {/* 확률 표 */}
      <div className="mt-8 p-4 bg-gray-700 rounded-lg">
        <h4 className="text-white font-bold mb-4">확률표</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {rouletteOptions.map((option, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-gray-600 rounded">
              <span className="text-white">
                {option.emoji} {option.name}
              </span>
              <span className="text-gray-300">
                {option.probability}%
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-xs text-gray-400 space-y-1">
          <p>• 베팅 금액은 게임 시작과 동시에 차감됩니다</p>
          <p>• 하루에 최대 5번까지 플레이 가능합니다</p>
        </div>
      </div>
    </div>
  );
};

export default Roulette;