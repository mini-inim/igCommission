// components/AddItem.jsx
import React, { useState } from "react";
import { useItems } from "../../contexts/ItemContext";

const AddItem = () => {
  const { items, addItem, updateItem, removeItem } = useItems();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async () => {
    // 입력값 검증
    if (!name.trim() || !price.trim()) {
      setError("이름과 가격을 모두 입력해주세요.");
      return;
    }

    if (isNaN(Number(price)) || Number(price) <= 0) {
      setError("올바른 가격을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      await addItem({ 
        name: name.trim(), 
        price: Number(price), 
        image: image.trim() || "" 
      });
      
      // 성공 후 폼 초기화
      setName("");
      setPrice("");
      setImage("");
    } catch (err) {
      console.error("아이템 추가 실패:", err);
      setError("아이템 추가 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrice = async (itemId, currentPrice) => {
    try {
      await updateItem(itemId, { price: currentPrice + 100 });
    } catch (err) {
      console.error("가격 업데이트 실패:", err);
      setError("가격 업데이트 중 오류가 발생했습니다.");
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    
    try {
      await removeItem(itemId);
    } catch (err) {
      console.error("아이템 삭제 실패:", err);
      setError("아이템 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 m-6">
      {/* 에러 메시지 */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* 아이템 추가 폼 */}
      <div className="p-4 bg-white rounded shadow">
        <h3 className="font-bold mb-4">새 상품 추가</h3>
        <div className="space-y-3">
          <input 
            value={name} 
            onChange={e => setName(e.target.value)}
            placeholder="상품 이름" 
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            disabled={loading}
          />
          <input 
            value={price} 
            onChange={e => setPrice(e.target.value)}
            placeholder="가격 (숫자만)" 
            type="number"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            disabled={loading}
          />
          <input 
            value={image} 
            onChange={e => setImage(e.target.value)}
            placeholder="이미지 URL (선택사항)" 
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            disabled={loading}
          />
          <button 
            onClick={handleAdd} 
            disabled={loading}
            className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "추가 중..." : "상품 추가"}
          </button>
        </div>
      </div>

      {/* 기존 아이템 리스트 & 수정/삭제 */}
      <div className="p-4 bg-white rounded shadow">
        <h3 className="font-bold mb-4">기존 상품 관리</h3>
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-4">등록된 상품이 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {items.map(item => (
              <li key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-600 ml-2">₩{item.price.toLocaleString()}</span>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleUpdatePrice(item.id, item.price)}
                    className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                  >
                    +100원
                  </button>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AddItem;