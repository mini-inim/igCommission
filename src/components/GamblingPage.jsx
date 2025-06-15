import React, { useState } from 'react';
import Navigation from './Navigation';

const GamblingPage = ({ user, userStats, setCurrentPage, handleLogout }) => {
  const [bet, setBet] = useState(100);
  const [result, setResult] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleSpin = () => {
    if (bet > userStats.coins) return;

    setIsSpinning(true);
    setResult(null);

    setTimeout(() => {
      const won = Math.random() > 0.5;
      setResult({ won, amount: won ? bet * 2 : -bet });
      setIsSpinning(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation user={user} userStats={userStats} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">🎰 럭키 스핀</h2>
          <p className="text-gray-400">운을 시험해보세요!</p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-8 mb-8">
          <div className="text-center mb-8">
            <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-yellow-400 to-red-500 flex items-center justify-center text-6xl mb-6 ${isSpinning ? 'animate-spin' : ''}`}>
              🎰
            </div>

            {result && (
              <div className={`text-2xl font-bold mb-4 ${result.won ? 'text-green-400' : 'text-red-400'}`}>
                {result.won ? `🎉 승리! +${result.amount} 코인` : `😢 패배! ${result.amount} 코인`}
              </div>
            )}
          </div>

          <div className="max-w-md mx-auto space-y-6">
            <div>
              <label className="block text-white font-medium mb-2">베팅 금액</label>
              <input
                type="number"
                value={bet}
                onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="1"
                max={userStats.coins}
              />
            </div>

            <button
              onClick={handleSpin}
              disabled={isSpinning || bet > userStats.coins}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSpinning ? '스핀 중...' : '스핀!'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{userStats.wins}</div>
            <div className="text-gray-400">승리</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{userStats.losses}</div>
            <div className="text-gray-400">패배</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{userStats.level}</div>
            <div className="text-gray-400">레벨</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{userStats.coins.toLocaleString()}</div>
            <div className="text-gray-400">코인</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamblingPage;