// components/AddGold.jsx
import React, { useState } from "react";
import { useUsers } from "../../contexts/UserContext"; // UserContext 경로에 맞게 조정

const AddGold = () => {
  const { users, updateUser } = useUsers();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [goldAmount, setGoldAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpdateGold = async (userId, currentGold, changeAmount, operation) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      let newGold;
      if (operation === "add") {
        newGold = currentGold + changeAmount;
      } else if (operation === "subtract") {
        newGold = Math.max(0, currentGold - changeAmount); // 음수 방지
      } else if (operation === "set") {
        newGold = changeAmount;
      }

      await updateUser(userId, { gold: newGold });
      setSuccess(`골드가 ${newGold.toLocaleString()}으로 업데이트되었습니다.`);
      
      // 성공 메시지 3초 후 제거
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("골드 업데이트 실패:", err);
      setError("골드 업데이트 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomGoldUpdate = async () => {
    if (!selectedUserId || !goldAmount.trim()) {
      setError("사용자와 골드 수량을 모두 선택/입력해주세요.");
      return;
    }

    const amount = Number(goldAmount);
    if (isNaN(amount) || amount < 0) {
      setError("올바른 골드 수량을 입력해주세요.");
      return;
    }

    const user = users.find(u => u.id === selectedUserId);
    if (!user) {
      setError("선택된 사용자를 찾을 수 없습니다.");
      return;
    }

    await handleUpdateGold(selectedUserId, user.gold, amount, "set");
    setGoldAmount("");
    setSelectedUserId("");
  };

  const quickGoldUpdate = (userId, currentGold, amount) => {
    handleUpdateGold(userId, currentGold, amount, "add");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 m-6">
      {/* 성공/에러 메시지 */}
      {success && (
        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* 사용자 목록 & 빠른 골드 조정 */}
      <div className="p-4 bg-white rounded shadow">
        <h3 className="font-bold mb-4">사용자 골드 관리</h3>
        {users.length === 0 ? (
          <p className="text-gray-500 text-center py-4">등록된 사용자가 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {users.map(user => (
              <div key={user.id} className="p-3 bg-gray-50 rounded">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-medium">
                      {user.displayName}
                    </span>
                    <span className="text-lg font-bold text-yellow-600 ml-3">
                      {user.gold?.toLocaleString() || 0} 골드
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => quickGoldUpdate(user.id, user.gold || 0, 100)}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                    disabled={loading}
                  >
                    +100
                  </button>
                  <button
                    onClick={() => quickGoldUpdate(user.id, user.gold || 0, 500)}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                    disabled={loading}
                  >
                    +500
                  </button>
                  <button
                    onClick={() => quickGoldUpdate(user.id, user.gold || 0, 1000)}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                    disabled={loading}
                  >
                    +1000
                  </button>
                  <button
                    onClick={() => handleUpdateGold(user.id, user.gold || 0, 100, "subtract")}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    disabled={loading}
                  >
                    -100
                  </button>
                  <button
                    onClick={() => handleUpdateGold(user.id, user.gold || 0, 0, "set")}
                    className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                    disabled={loading}
                  >
                    초기화
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddGold;