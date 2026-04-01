import React from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import '../styles/ShopPage.css';

const ShopPage = () => {
  const shopItems = [
    { id: 1, name: '경험치 부스터', desc: '1시간 동안 획득 경험치 2배', price: 500, icon: '🔥' },
    { id: 2, name: '스탯 초기화권', desc: '모든 스탯을 초기화합니다', price: 1000, icon: '🔄' },
    { id: 3, name: '황금 알', desc: '희귀한 펫이 부화할 확률 증가', price: 2000, icon: '🥚' },
    { id: 4, name: '에너지 드링크', desc: '오늘의 피로도를 10 회복', price: 300, icon: '🥤' },
    { id: 5, name: '이름 변경권', desc: '펫의 이름을 변경합니다', price: 800, icon: '🏷️' },
    { id: 6, name: '신비한 열매', desc: '무작위 스탯 1~3 증가', price: 1500, icon: '🍒' },
    { id: 7, name: '부화 촉진제', desc: '알 부화 시간을 단축시킵니다', price: 600, icon: '⏱️' },
    { id: 8, name: '펫 간식', desc: '펫의 친밀도를 소폭 상승시킵니다', price: 200, icon: '🍖' },
  ];

  return (
    <div className="screen active" id="screenShop">
      <TopBar />
      
      <div className="shop-content-wrapper">
        {/* 상단 고정 영역 (상점 주인) */}
        <div className="shop-header-section">
          <div className="shop-coin-display">
            <span className="coin-icon">🪙</span>
            <span className="coin-amount">1,200</span>
          </div>
          
          <div className="shop-npc-container">
            <img src="/images/animals/egg.png" alt="상점 주인" className="shop-npc-img" />
          </div>
          
          <div className="shop-speech-bubble">
            <p>어서오세요!</p>
            <p>무엇을 찾으시나요?</p>
          </div>
        </div>

        {/* 하단 스크롤 영역 (아이템 리스트) */}
        <div className="shop-item-list">
          {shopItems.map(item => (
            <div key={item.id} className="shop-item-card">
              <div className="shop-item-icon">{item.icon}</div>
              <div className="shop-item-info">
                <div className="shop-item-name">{item.name}</div>
                <div className="shop-item-desc">{item.desc}</div>
              </div>
              <div className="shop-item-price">
                <span className="price-icon">🪙</span>
                <span className="price-amount">{item.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ShopPage;
