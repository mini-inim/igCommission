import React, { useEffect, useState } from "react";
import { useAuth } from '../../contexts/AuthContext';
import { useItems } from '../../contexts/ItemContext';
import { getFirestore, collection, getDocs, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useUsers } from "../../contexts/UserContext";

export const UserItem = ({ user }) => {
  const { loading: authLoading } = useAuth();
  const { getUserById, loading: usersLoading } = useUsers();
  const { items } = useItems();
  const [ownedItems, setOwnedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserItems = async () => {
      if (authLoading || usersLoading || !user) return;
      
      setLoading(true);
      setError(null);

      try {
        const inventoryRef = collection(db, "users", user.uid, "inventory");
        const inventorySnap = await getDocs(inventoryRef);

        if (inventorySnap.empty) {
          setOwnedItems([]);
          return;
        }

        const userItems = inventorySnap.docs.map((docSnap) => {
          const data = docSnap.data();
          const contextItem = items.find(item => item.id === data.itemId);

          return {
            itemId: data.itemId || docSnap.id,
            name: data.itemName || contextItem?.name || "이름 없음",
            quantity: data.quantity || 0,
          };
        });

        const validItems = userItems.filter(item => item.quantity > 0);
        setOwnedItems(validItems);
        
      } catch (err) {
        console.error("Error fetching user items:", err);
        setError("아이템을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserItems();
  }, [user, authLoading, usersLoading, items]);

  if (authLoading || usersLoading) {
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
        {loading ? (
          <p className="text-gray-500">아이템을 불러오는 중...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <ul className="space-y-2">
            {ownedItems.length > 0 ? (
              ownedItems.map((item, idx) => (
                <li key={`${item.itemId}-${idx}`} className="text-gray-700 text-lg font-bold">
                  ✅ {item.name} x{item.quantity}
                </li>
              ))
            ) : (
              <li className="text-gray-500">보유한 아이템이 없습니다.</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserItem;