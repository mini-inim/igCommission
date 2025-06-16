// components/ShopPage.jsx
import React, { useState } from 'react';
import Navigation from './common/Navigation';
import UserItem from './content/UserItem';
import { useItems } from '../contexts/ItemContext';
import { useUsers } from '../contexts/UserContext';
import { useInventory } from '../contexts/InventoryContext';
import { db } from "../firebase";
import { 
  doc, 
  runTransaction,
  increment
} from "firebase/firestore";
import UsingItem from './content/UsingItem';

const ShopPage = ({ user }) => {
  const { items } = useItems();
  const { updateUser, getUserById } = useUsers();
  const { refreshInventory, inventory } = useInventory();
  
  const [purchaseLoading, setPurchaseLoading] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });

  // 방어권 보유량 체크 함수
  const getDefenseCount = () => {
    const defenseItem = inventory.find(item => item.itemName === '방어권');
    return defenseItem ? defenseItem.quantity : 0;
  };

  // 구매 가능 여부 체크 함수
  const canPurchaseItem = (item) => {
    if (!user) return { canPurchase: false, reason: '로그인 필요' };
    if (userGold < (item.price || 0)) return { canPurchase: false, reason: '골드 부족' };
    
    // 방어권 구매 제한 체크
    if (item.name === '방어권' && getDefenseCount() >= 10) {
      return { canPurchase: false, reason: '방어권 최대 보유 (10개)' };
    }
    
    return { canPurchase: true, reason: '구매' };
  };

  // 메시지 표시 함수
  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  // 아이템 구매 함수
  const handlePurchase = async (item) => {
    const purchaseCheck = canPurchaseItem(item);
    
    if (!purchaseCheck.canPurchase) {
      if (purchaseCheck.reason === '방어권 최대 보유 (10개)') {
        showMessage('방어권은 최대 10개까지만 보유할 수 있습니다.', 'error');
      } else if (purchaseCheck.reason === '로그인 필요') {
        showMessage('로그인이 필요합니다.', 'error');
      } else if (purchaseCheck.reason === '골드 부족') {
        showMessage('골드가 부족합니다.', 'error');
      }
      return;
    }

    // 구매 진행 중 표시
    setPurchaseLoading(prev => ({ ...prev, [item.id]: true }));

    try {
      let updatedGold;
      
      // 트랜잭션을 사용해서 동시성 문제 해결
      await runTransaction(db, async (transaction) => {
        // 1. 사용자 정보 조회
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new Error('사용자 정보를 찾을 수 없습니다.');
        }

        const userData = userDoc.data();
        const currentGold = userData.gold || 0;

        // 2. 골드 부족 체크
        if (currentGold < item.price) {
          throw new Error(`골드가 부족합니다. (보유: ${currentGold.toLocaleString()}, 필요: ${item.price.toLocaleString()})`);
        }

        // 3. 인벤토리에서 해당 아이템 확인
        const inventoryRef = doc(db, 'users', user.uid, 'inventory', item.id);
        const inventoryDoc = await transaction.get(inventoryRef);

        // 4. 골드 차감
        transaction.update(userRef, {
          gold: increment(-item.price)
        });

        // 업데이트될 골드 값 계산 (UI 업데이트용)
        updatedGold = currentGold - item.price;

        // 5. 인벤토리 업데이트
        if (inventoryDoc.exists()) {
          // 이미 보유한 아이템이면 수량 증가
          transaction.update(inventoryRef, {
            quantity: increment(1),
            lastPurchasedAt: new Date()
          });
        } else {
          // 새로운 아이템이면 추가
          transaction.set(inventoryRef, {
            itemId: item.id,
            itemName: item.name,
            itemImage: item.image,
            itemPrice: item.price,
            quantity: 1,
            purchasedAt: new Date(),
            lastPurchasedAt: new Date()
          });
        }
      });

      // 트랜잭션 성공 후 UserContext 업데이트로 네비게이션 실시간 갱신
      await updateUser(user.uid, { gold: updatedGold });

      // InventoryContext 실시간 갱신 (Firebase에서 다시 로드)
      console.log('구매 완료, 인벤토리 새로고침 시작');
      await refreshInventory();
      console.log('인벤토리 새로고침 완료');

      showMessage(`${item.name}을(를) 구매했습니다!`, 'success');
      
    } catch (error) {
      console.error('구매 오류:', error);
      showMessage(error.message || '구매 중 오류가 발생했습니다.', 'error');
    } finally {
      setPurchaseLoading(prev => ({ ...prev, [item.id]: false }));
    }
  };

  // 메시지 스타일
  const getMessageStyle = (type) => {
    const baseStyle = "fixed bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300";
    switch (type) {
      case 'success':
        return `${baseStyle} bg-green-500 text-white`;
      case 'error':
        return `${baseStyle} bg-red-500 text-white`;
      default:
        return `${baseStyle} bg-blue-500 text-white`;
    }
  };

  // 현재 보유 금액
  const userGold = getUserById(user?.uid)?.gold || 0;

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* 메시지 알림 */}
      {message.text && (
        <div className={getMessageStyle(message.type)}>
          {message.text}
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">아이템 상점</h2>
          <p className="text-gray-600">관리자가 등록한 다양한 아이템을 구매하여 모험을 더욱 풍성하게 만드세요!</p>
        </div>

        {/* 상점 아이템 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
          {!items || items.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🛍️</div>
              <p className="text-gray-500 text-lg">아직 등록된 상품이 없습니다.</p>
              <p className="text-gray-400 text-sm mt-2">관리자가 상품을 등록하면 여기에 표시됩니다.</p>
            </div>
          ) : (
            items
              .filter(item => item && item.id)
              .map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    {item.image ? (
                      item.image.startsWith('http') ? (
                        <img src={item.image} alt={item.name || '상품 이미지'} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-6xl">{item.image}</span>
                      )
                    ) : (
                      <span className="text-6xl">📦</span>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{item.name || '상품명 없음'}</h3>
                    {item.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-purple-600">
                        {(item.price || 0).toLocaleString()} 
                      </span>
                        <button 
                          onClick={() => handlePurchase(item)}
                          disabled={purchaseLoading[item.id] || !canPurchaseItem(item).canPurchase}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            purchaseLoading[item.id]
                              ? 'bg-gray-400 cursor-not-allowed'
                              : canPurchaseItem(item).canPurchase
                              ? 'bg-purple-600 hover:bg-purple-700 hover:scale-105 active:scale-95'
                              : 'bg-gray-400 cursor-not-allowed'
                          } text-white text-sm`}
                        >
                          {purchaseLoading[item.id] ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                              구매중...
                            </div>
                          ) : canPurchaseItem(item).canPurchase ? (
                            '구매'
                          ) : (
                            '구매 불가'
                          )}
                        </button>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>

        {/* 사용자 정보 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserItem user={user} />
          <UsingItem user={user} />
        </div>
      </div>
    </div>
  );
};

export default ShopPage;