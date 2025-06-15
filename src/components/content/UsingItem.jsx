import { useItems } from "../../contexts/ItemContext";
import { useUsers } from "../../contexts/UserContext";
import { useState } from "react";

const UsingItem = ({user}) => {
  const { users, getUserById } = useUsers();
  const { items } = useItems();
  const [ownedItems, setOwnedItems] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedItem, setSelectedItem] = useState("");

    return(
        <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">아이템 사용 / 양도</h3>
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="space-y-4">
                    {/* 사용자 선택 */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            사용자 선택
                        </label>
                        <select 
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">사용자를 선택하세요</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.displayName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 아이템 선택 */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            보유 아이템
                        </label>
                        <select 
                            value={selectedItem}
                            onChange={(e) => setSelectedItem(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">아이템을 선택하세요</option>
                            {ownedItems.map((item, index) => (
                                <option key={index} value={item.id || item}>
                                    {item.name || item}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 버튼 */}
                    <div className="flex gap-2 mt-6">
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                            아이템 사용
                        </button>
                        <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">
                            아이템 양도
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UsingItem;