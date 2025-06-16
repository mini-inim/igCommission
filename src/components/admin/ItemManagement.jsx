// components/admin/ItemManagement.jsx
import React, { useState } from "react";
import { useItems } from "../../contexts/ItemContext";

const ItemManagement = () => {
  const { items, updateItem, removeItem } = useItems();
  const [loading, setLoading] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 메시지 표시
  const showMessage = (text, type = 'info') => {
    if (type === 'error') {
      setError(text);
      setTimeout(() => setError(""), 3000);
    } else {
      setSuccess(text);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  // 가격 업데이트 함수
  const handlePriceUpdate = async (itemId, currentPrice, changeAmount, operation) => {
    try {
      setLoading(prev => ({ ...prev, [itemId]: true }));
      
      let newPrice;
      if (operation === "add") {
        newPrice = currentPrice + changeAmount;
      } else if (operation === "subtract") {
        newPrice = Math.max(0, currentPrice - changeAmount); // 음수 방지
      }

      await updateItem(itemId, { price: newPrice });
      
      const item = items.find(i => i.id === itemId);
      showMessage(`${item?.name}의 가격이 ${newPrice.toLocaleString()}원으로 업데이트되었습니다.`, 'success');
      
    } catch (err) {
      console.error("가격 업데이트 실패:", err);
      showMessage("가격 업데이트 중 오류가 발생했습니다.", 'error');
    } finally {
      setLoading(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // 아이템 삭제 함수
  const handleRemoveItem = async (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (!window.confirm(`"${item?.name}"을(를) 정말 삭제하시겠습니까?`)) return;
    
    try {
      setLoading(prev => ({ ...prev, [itemId]: true }));
      await removeItem(itemId);
      showMessage(`${item?.name}이(가) 삭제되었습니다.`, 'success');
    } catch (err) {
      console.error("아이템 삭제 실패:", err);
      showMessage("아이템 삭제 중 오류가 발생했습니다.", 'error');
    } finally {
      setLoading(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const getMessageStyle = (type) => {
    const baseStyle = "fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300";
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
    <div>
      {/* 메시지 알림 */}
      {success && (
        <div className={getMessageStyle('success')}>
          {success}
        </div>
      )}
      {error && (
        <div className={getMessageStyle('error')}>
          {error}
        </div>
      )}

      <div className="max-w-6xl mx-auto ">
        {/* 상품 관리 제목 */}
        <div className="flex justify-between items-center mb-3">
          {/* 왼쪽 - 제목 */}
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-1">상품 관리</h2>
          </div>
        </div>

        {/* 상품 목록 */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 text-lg">등록된 상품이 없습니다.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      {/* 왼쪽: 상품 정보 */}
                      <div className="flex-1 pr-6">
                        <div className="flex items-center mb-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                            {item.image ? (
                              item.image.startsWith('http') ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-full" />
                              ) : (
                                <span className="text-lg">{item.image}</span>
                              )
                            ) : (
                              <span className="text-lg">📦</span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-gray-800">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-500">상품 ID: {item.id}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6 mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold text-yellow-600">
                              {item.price.toLocaleString()}
                            </span>
                            <span className="text-gray-500">원</span>
                          </div>
                        </div>

                        {/* 상품 상태 (추가 정보가 있다면) */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            📦 상품 정보
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold border-2 border-blue-200">
                              활성 상품
                            </span>
                            {item.description && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-semibold border-2 border-gray-200">
                                설명 있음
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 오른쪽: 가격 조정 */}
                      <div className="flex-shrink-0 w-80">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          💎 가격 조정
                        </label>
                        <div className="bg-gradient-to-r from-green-50 to-yellow-50 p-4 rounded-2xl border-2 border-green-100">
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <button
                              onClick={() => handlePriceUpdate(item.id, item.price, 100, "add")}
                              disabled={loading[item.id]}
                              className="px-3 py-2 bg-green-500 text-white text-sm rounded-xl hover:bg-green-600 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-green-200 font-semibold disabled:opacity-50 disabled:transform-none"
                            >
                              +100
                            </button>
                            <button
                              onClick={() => handlePriceUpdate(item.id, item.price, 500, "add")}
                              disabled={loading[item.id]}
                              className="px-3 py-2 bg-green-500 text-white text-sm rounded-xl hover:bg-green-600 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-green-200 font-semibold disabled:opacity-50 disabled:transform-none"
                            >
                              +500
                            </button>
                            <button
                              onClick={() => handlePriceUpdate(item.id, item.price, 1000, "add")}
                              disabled={loading[item.id]}
                              className="px-3 py-2 bg-green-500 text-white text-sm rounded-xl hover:bg-green-600 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-green-200 font-semibold disabled:opacity-50 disabled:transform-none"
                            >
                              +1000
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <button
                              onClick={() => handlePriceUpdate(item.id, item.price, 100, "subtract")}
                              disabled={loading[item.id]}
                              className="px-3 py-2 bg-red-500 text-white text-sm rounded-xl hover:bg-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-red-200 font-semibold disabled:opacity-50 disabled:transform-none"
                            >
                              -100
                            </button>
                            <button
                              onClick={() => handlePriceUpdate(item.id, item.price, 500, "subtract")}
                              disabled={loading[item.id]}
                              className="px-3 py-2 bg-red-500 text-white text-sm rounded-xl hover:bg-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-red-200 font-semibold disabled:opacity-50 disabled:transform-none"
                            >
                              -500
                            </button>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={loading[item.id]}
                              className="px-3 py-2 bg-gray-500 text-white text-sm rounded-xl hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-gray-200 font-semibold disabled:opacity-50 disabled:transform-none"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 로딩 표시 */}
                    {loading[item.id] && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-xl border-2 border-blue-100">
                        <div className="text-sm text-blue-600 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                          <span className="font-semibold">업데이트 중...</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemManagement;