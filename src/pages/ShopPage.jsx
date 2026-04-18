import React, { useCallback, useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import TypewriterSpeech from '../components/TypewriterSpeech';
import { useGameUser } from '../context/GameUserContext';
import { fetchRpgJson, formatCoin } from '../api/rpgClient';
import '../styles/ShopPage.css';

const COIN_IMG = '/images/ui/coin.png';

const SHOP_NPC_SPEECH_LINES = [{ text: '어서오시게!' }, { text: '무엇을 찾으려왔나?' }];

function ShopItemIcon({ imageUrl, iconEmoji }) {
  const [imgBroken, setImgBroken] = useState(false);
  if (imageUrl && !imgBroken) {
    return (
      <img
        className="shop-item-icon-img"
        src={imageUrl}
        alt=""
        width={32}
        height={32}
        decoding="async"
        onError={() => setImgBroken(true)}
      />
    );
  }
  return <span className="shop-item-icon-emoji">{iconEmoji || '❔'}</span>;
}

const ShopPage = () => {
  const { userId, coins, applyPurchaseResult } = useGameUser();
  const [items, setItems] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [purchasingId, setPurchasingId] = useState(null);
  const [purchaseMsg, setPurchaseMsg] = useState(null);

  const loadItems = useCallback(async () => {
    setLoadError(null);
    try {
      const rows = await fetchRpgJson('/api/items');
      setItems(Array.isArray(rows) ? rows : []);
    } catch {
      setItems([]);
      setLoadError('상품 목록을 불러오지 못했습니다. 백엔드 서버와 DB를 확인해 주세요.');
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const onPurchase = async (item) => {
    setPurchaseMsg(null);
    setPurchasingId(item.id);
    try {
      const result = await fetchRpgJson('/api/inventory/purchase', {
        method: 'POST',
        body: JSON.stringify({ userId, itemId: item.id }),
      });
      applyPurchaseResult(result);
      setPurchaseMsg(`「${item.name}」을(를) 구매했습니다.`);
    } catch (e) {
      if (e.status === 402) {
        setPurchaseMsg('코인이 부족합니다.');
      } else {
        setPurchaseMsg('구매에 실패했습니다.');
      }
    } finally {
      setPurchasingId(null);
    }
  };

  const canAfford = (price) => typeof coins === 'number' && coins >= price;

  return (
    <div className="screen active" id="screenShop">
      <TopBar />

      <div className="shop-content-wrapper">
        <div className="shop-header-section">
          <video
            className="shop-header-bg-video"
            autoPlay
            loop
            muted
            playsInline
            aria-hidden
          >
            <source src="/images/shop/shop_npc.mp4" type="video/mp4" />
          </video>
          <div className="shop-header-overlay" aria-hidden="true" />
          <div className="shop-coin-display">
            <img className="coin-icon" src={COIN_IMG} alt="" width={22} height={22} decoding="async" />
            <span className="coin-amount">{formatCoin(coins)}</span>
          </div>
          <div className="shop-speech-bubble" aria-live="polite">
            <TypewriterSpeech lines={SHOP_NPC_SPEECH_LINES} charMs={32} linePauseMs={380} />
          </div>
        </div>

        {purchaseMsg ? (
          <div className="shop-toast" role="status">
            {purchaseMsg}
          </div>
        ) : null}
        {loadError ? (
          <div className="shop-toast shop-toast--error" role="alert">
            {loadError}
          </div>
        ) : null}

        <div className="shop-item-list">
          {items.map((item) => (
            <div key={item.id} className="shop-item-card">
              <div className="shop-item-top">
                <div className="shop-item-icon">
                  <ShopItemIcon imageUrl={item.imageUrl} iconEmoji={item.iconEmoji} />
                </div>
                <div className="shop-item-info">
                  <div className="shop-item-name">{item.name}</div>
                  <div className="shop-item-desc">{item.description}</div>
                </div>
                <div className="shop-item-price">
                  <img className="price-icon" src={COIN_IMG} alt="" width={14} height={14} decoding="async" />
                  <span className="price-amount">{item.price?.toLocaleString?.('ko-KR') ?? item.price}</span>
                </div>
              </div>
              <button
                type="button"
                className="shop-buy-btn"
                disabled={
                  purchasingId === item.id ||
                  coins == null ||
                  !canAfford(item.price)
                }
                onClick={() => onPurchase(item)}
              >
                {purchasingId === item.id ? '처리 중…' : '구매'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ShopPage;
