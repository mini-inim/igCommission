// components/content/UsingItem.jsx
import React, { useState } from "react";
import { useBattle } from '../../contexts/BattleContext';
import { useUsers } from '../../contexts/UserContext';
import { useInventory } from '../../contexts/InventoryContext';
import { executeItemEffect, ITEM_EFFECT_NAMES, ITEM_EFFECT_DESCRIPTIONS, ITEM_EFFECT_COLORS, ITEM_EFFECT_EMOJIS, ITEM_EFFECTS } from '../battle/itemEffect';
import BattleStatus from "../battle/BattleStatus";

const UsingItem = ({ user }) => {
  const { updateInjuries, updateTeamInjuries, getBattleUserById, getActiveBattleUsers, getUsersByTeam, checkAndConsumeDefense } = useBattle();
  const { users } = useUsers();
  const { inventory, loading: inventoryLoading, consumeItem, transferItem } = useInventory();
  const [selectedItem, setSelectedItem] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [actionType, setActionType] = useState('use'); // 'use' 또는 'transfer'
  const [message, setMessage] = useState({ text: '', type: '' });

  // 아이템 이름으로 효과 매핑
  const getItemEffect = (itemName) => {
    const effectMap = {
      '공격권': ITEM_EFFECTS.ATTACK,
      '특수 공격권': ITEM_EFFECTS.SPECIAL_ATTACK,
      '방어권': ITEM_EFFECTS.DEFENSE,
      '치료권': ITEM_EFFECTS.HEAL,
      '특수 치료권': ITEM_EFFECTS.SPECIAL_HEAL
    };
    return effectMap[itemName];
  };

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const getSelectedItemData = () => {
    const item = inventory.find(item => item.id === selectedItem);
    if (item) {
      return {
        ...item,
        itemEffect: getItemEffect(item.itemName)
      };
    }
    return null;
  };

  const handleUseItem = async () => {
    if (!selectedItem || !targetUserId) {
      showMessage('아이템과 대상을 모두 선택해주세요.', 'error');
      return;
    }

    const itemData = getSelectedItemData();
    if (!itemData || !itemData.itemEffect) {
      showMessage('아이템 효과를 찾을 수 없습니다.', 'error');
      return;
    }

    try {
      // 아이템 효과 실행
      const resultMessage = await executeItemEffect(
        itemData.itemEffect,
        targetUserId,
        null,
        { updateInjuries, updateTeamInjuries, getBattleUserById, getUsersByTeam, checkAndConsumeDefense }
      );

      // InventoryContext의 consumeItem 사용 (Firebase 트랜잭션 포함)
      await consumeItem(selectedItem);

      showMessage(resultMessage, 'success');
      setSelectedItem('');
      setTargetUserId('');
      
    } catch (error) {
      console.error('아이템 사용 실패:', error);
      showMessage(error.message || '아이템 사용 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleTransferItem = async () => {
    if (!selectedItem || !targetUserId) {
      showMessage('아이템과 대상을 모두 선택해주세요.', 'error');
      return;
    }

    if (targetUserId === user.uid) {
      showMessage('자신에게는 양도할 수 없습니다.', 'error');
      return;
    }

    const itemData = getSelectedItemData();
    if (!itemData) {
      showMessage('선택한 아이템을 찾을 수 없습니다.', 'error');
      return;
    }

    try {
      // InventoryContext의 transferItem 사용 (Firebase 트랜잭션 포함)
      await transferItem(selectedItem, targetUserId);

      const targetUser = users.find(u => u.id === targetUserId);
      showMessage(`${itemData.itemName}을(를) ${targetUser?.displayName || '사용자'}에게 양도했습니다.`, 'success');
      setSelectedItem('');
      setTargetUserId('');
      
    } catch (error) {
      console.error('아이템 양도 실패:', error);
      showMessage(error.message || '아이템 양도 중 오류가 발생했습니다.', 'error');
    }
  };

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

  if (inventoryLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-center text-gray-500">아이템 로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 메시지 알림 */}
      {message.text && (
        <div className={getMessageStyle(message.type)}>
          {message.text}
        </div>
      )}

      {/* 아이템 사용/양도 */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">아이템 사용 / 양도</h3>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="space-y-4">
            {/* 액션 타입 선택 */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                액션 선택
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="use"
                    checked={actionType === 'use'}
                    onChange={(e) => setActionType(e.target.value)}
                    className="mr-2"
                  />
                  아이템 사용
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="transfer"
                    checked={actionType === 'transfer'}
                    onChange={(e) => setActionType(e.target.value)}
                    className="mr-2"
                  />
                  아이템 양도
                </label>
              </div>
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
                {inventory.map((item) => (
                  <option key={item.id} value={item.id}>
                    {ITEM_EFFECT_EMOJIS[getItemEffect(item.itemName)] || '📦'} {item.itemName} (x{item.quantity})
                    {getItemEffect(item.itemName) && ` - ${ITEM_EFFECT_NAMES[getItemEffect(item.itemName)]}`}
                  </option>
                ))}
              </select>
              
              {/* 선택된 아이템 효과 설명 */}
              {selectedItem && getSelectedItemData()?.itemEffect && (
                <div className={`mt-2 p-2 rounded text-xs ${ITEM_EFFECT_COLORS[getSelectedItemData().itemEffect]}`}>
                  {ITEM_EFFECT_DESCRIPTIONS[getSelectedItemData().itemEffect]}
                </div>
              )}
            </div>

            {/* 대상 선택 */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {actionType === 'use' ? '대상 선택' : '양도받을 사용자'}
              </label>
              <select 
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">사용자를 선택하세요</option>
                {(actionType === 'use' ? getActiveBattleUsers() : users)
                  .filter(u => actionType === 'transfer' ? u.id !== user.uid : true)
                  .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.displayName || u.email}
                    {actionType === 'use' && (
                      ` (부상: ${u.injuries || 0}${u.isEliminated ? ' - 탈락' : ''})`
                    )}
                    {u.team && ` [${u.team}팀]`}
                  </option>
                ))}
              </select>
            </div>

            {/* 실행 버튼 */}
            <div className="mt-6">
              {actionType === 'use' ? (
                <button 
                  onClick={handleUseItem}
                  disabled={!selectedItem || !targetUserId}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  아이템 사용
                </button>
              ) : (
                <button 
                  onClick={handleTransferItem}
                  disabled={!selectedItem || !targetUserId}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  아이템 양도
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsingItem;