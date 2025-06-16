// components/admin/ItemManagement.jsx
import React, { useState } from "react";
import { Package, Plus, Minus, Trash2, Coins } from 'lucide-react';
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

  // 아이템 이모지 또는 이미지
  const getItemDisplay = (item) => {
    if (item.image) {
      if (item.image.startsWith('http')) {
        return (
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-8 h-8 object-cover rounded-full border border-gray-300" 
          />
        );
      } else {
        return <span className="text-2xl">{item.image}</span>;
      }
    }
    return <Package className="w-6 h-6 text-gray-400" />;
  };

  // 아이템 상태 표시
  const getItemStatus = (item) => {
    const statuses = [];
    statuses.push({ label: '활성', color: 'bg-green-100 text-green-700 border border-green-200' });
    
    if (item.description) {
      statuses.push({ label: '설명 있음', color: 'bg-blue-100 text-blue-700 border border-blue-200' });
    }
    
    if (item.price === 0) {
      statuses.push({ label: '무료', color: 'bg-yellow-100 text-yellow-700 border border-yellow-200' });
    }

    return statuses;
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

      {/* 통일된 스타일로 변경 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5" />
              상품 관리
            </h2>
            <div className="text-sm text-gray-500">
              총 {items.length}개 상품
            </div>
          </div>
        </div>

        <div className="p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">등록된 상품이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    {/* 상품 기본 정보 */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-shrink-0">
                        {getItemDisplay(item)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500">상품 ID: {item.id}</p>
                        
                        {/* 가격 표시 */}
                        <div className="flex items-center gap-1 mt-2">
                          <Coins className="w-4 h-4 text-yellow-600" />
                          <span className="font-bold text-yellow-600 text-lg">
                            {item.price.toLocaleString()}원
                          </span>
                        </div>

                        {/* 상품 상태 */}
                        <div className="flex gap-2 mt-2">
                          {getItemStatus(item).map((status, idx) => (
                            <span 
                              key={idx}
                              className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}
                            >
                              {status.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 로딩 표시 */}
                    {loading[item.id] && (
                      <div className="text-sm text-blue-600 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                        업데이트 중...
                      </div>
                    )}
                  </div>

                  {/* 관리 섹션 */}
                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Coins className="w-4 h-4 inline mr-1" />
                      가격 조정
                    </label>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      {/* 가격 증가 버튼들 */}
                      <div className="mb-3">
                        <div className="text-xs text-gray-600 mb-2">가격 증가</div>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => handlePriceUpdate(item.id, item.price, 100, "add")}
                            disabled={loading[item.id]}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                          >
                            <Plus className="w-3 h-3" />
                            100
                          </button>
                          <button
                            onClick={() => handlePriceUpdate(item.id, item.price, 500, "add")}
                            disabled={loading[item.id]}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                          >
                            <Plus className="w-3 h-3" />
                            500
                          </button>
                          <button
                            onClick={() => handlePriceUpdate(item.id, item.price, 1000, "add")}
                            disabled={loading[item.id]}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                          >
                            <Plus className="w-3 h-3" />
                            1000
                          </button>
                        </div>
                      </div>

                      {/* 가격 감소 및 삭제 버튼들 */}
                      <div>
                        <div className="text-xs text-gray-600 mb-2">가격 감소 및 관리</div>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => handlePriceUpdate(item.id, item.price, 100, "subtract")}
                            disabled={loading[item.id]}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            <Minus className="w-3 h-3" />
                            100
                          </button>
                          <button
                            onClick={() => handlePriceUpdate(item.id, item.price, 500, "subtract")}
                            disabled={loading[item.id]}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            <Minus className="w-3 h-3" />
                            500
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={loading[item.id]}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-3 h-3" />
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 설명이 있는 경우 표시 */}
                  {item.description && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm font-medium text-blue-700 mb-1">상품 설명</div>
                      <div className="text-sm text-blue-600">{item.description}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemManagement;