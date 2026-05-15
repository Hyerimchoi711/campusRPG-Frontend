import React, { useCallback, useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { useGameUser } from '../context/GameUserContext';
import { fetchRpgJsonAuth } from '../api/rpgClient';
import '../styles/InventoryPage.css';

const SLOT_COUNT = 20;

function SlotIcon({ imageUrl, iconEmoji }) {
  const [imgBroken, setImgBroken] = useState(false);
  if (imageUrl && !imgBroken) {
    return (
      <img
        className="inv-slot-img"
        src={imageUrl}
        alt=""
        width={40}
        height={40}
        decoding="async"
        onError={() => setImgBroken(true)}
      />
    );
  }
  return <span className="inv-slot-emoji">{iconEmoji || '❔'}</span>;
}

const InventoryPage = () => {
  const { userId, inventoryBump } = useGameUser();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchRpgJsonAuth(`/api/inventory?userId=${userId}`);
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setRows([]);
      setError('보관함을 불러오지 못했습니다. 백엔드와 DB 연결을 확인해 주세요.');
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load, inventoryBump]);

  const slots = [];
  for (let i = 0; i < SLOT_COUNT; i += 1) {
    slots.push(rows[i] ?? null);
  }

  return (
    <div id="screenInventory" className="screen active inventory-screen">
      <TopBar />
      <main className="inventory-main">
        <h1 className="inventory-title">아이템 보관함</h1>

        {error ? (
          <p className="inventory-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="inv-grid" aria-label="아이템 칸">
          {slots.map((cell, idx) => (
            <div
              key={idx}
              className={`inv-slot${cell ? ' inv-slot--filled' : ' inv-slot--empty'}`}
              title={cell ? `${cell.name} ×${cell.quantity}` : '빈 칸'}
            >
              {cell ? (
                <>
                  <div className="inv-slot-icon-wrap">
                    <SlotIcon imageUrl={cell.imageUrl} iconEmoji={cell.iconEmoji} />
                  </div>
                  {cell.quantity > 1 ? (
                    <span className="inv-qty">{cell.quantity}</span>
                  ) : null}
                </>
              ) : null}
            </div>
          ))}
        </div>

        {!error && rows.length === 0 ? (
          <p className="inventory-placeholder">아직 보유한 아이템이 없습니다. 상점에서 구매해 보세요.</p>
        ) : null}
      </main>
      <BottomNav />
    </div>
  );
};

export default InventoryPage;
