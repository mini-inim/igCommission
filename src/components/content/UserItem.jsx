// components/content/UserItem.jsx
import React from "react";
import { useInventory } from '../../contexts/InventoryContext';

export const UserItem = ({ user }) => {
  const { inventory, loading } = useInventory();

  if (loading) {
    return (
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">내 보유 아이템</h3>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">내 보유 아이템</h3>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-500">로그인이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">내 보유 아이템</h3>
      <div className="bg-white rounded-xl shadow-md p-6">
        <ul className="space-y-2">
          {inventory && inventory.length > 0 ? (
            inventory.map((item, idx) => (
              <li key={`${item.itemId}-${idx}`} className="text-gray-700 text-lg font-bold">
                ✅ {item.itemName} x{item.quantity}
              </li>
            ))
          ) : (
            <li className="text-gray-500">보유한 아이템이 없습니다.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default UserItem;