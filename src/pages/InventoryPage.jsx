import React, { useCallback, useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import InventoryItemModal from '../components/InventoryItemModal';
import BriefMessageModal from '../components/BriefMessageModal';
import { useAuth } from '../context/AuthContext';
import { useGameUser } from '../context/GameUserContext';
import {
  buildInventoryUseSuccessMessage,
  fetchInventory,
  inventoryUseErrorMessage,
  isFatigueRecoveryItem,
  normalizeInventoryRow,
  useInventoryItem,
} from '../api/inventoryClient';
import { getDailyFatigueFromStats } from '../utils/statsUi';
import { isDevMockAuthEnabled } from '../utils/devAuth';
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

function applyInventoryResponse(rows, data) {
  if (Array.isArray(data?.inventory)) {
    return data.inventory.map(normalizeInventoryRow).filter((r) => r && r.quantity > 0);
  }
  return rows;
}

function applyDevMockUse(row, me, mergeQuestGameSnapshotIntoMe) {
  const nextQty = Math.max(0, row.quantity - 1);
  const rowsUpdater = (prev) =>
    prev
      .map((r) => (r.id === row.id ? { ...r, quantity: nextQty } : r))
      .filter((r) => r.quantity > 0);

  if (isFatigueRecoveryItem(row) && me?.user?.stats) {
    const current = getDailyFatigueFromStats(me.user.stats);
    const nextFatigue = Math.max(0, current - 10);
    mergeQuestGameSnapshotIntoMe?.({
      user: { stats: { dailyFatigue: nextFatigue } },
    });
    return {
      rowsUpdater,
      message: `「${row.name}」을(를) 사용했습니다. (피로도 10 감소)`,
      needsRefreshMe: true,
    };
  }

  return {
    rowsUpdater,
    message: `「${row.name}」을(를) 사용했습니다.`,
    needsRefreshMe: false,
  };
}

const InventoryPage = () => {
  const { me, refreshMe, mergeQuestGameSnapshotIntoMe } = useAuth();
  const { inventoryBump } = useGameUser();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [using, setUsing] = useState(false);
  const [toast, setToast] = useState(null);
  const [toastError, setToastError] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchInventory();
      setRows(data);
    } catch {
      setRows([]);
      setError('보관함을 불러오지 못했습니다. 백엔드와 DB 연결을 확인해 주세요.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, inventoryBump]);

  const clearToast = useCallback(() => {
    setToast(null);
    setToastError(false);
  }, []);

  const closeModal = useCallback(() => {
    if (using) return;
    setSelectedRow(null);
  }, [using]);

  const handleUse = async () => {
    if (!selectedRow?.id || using) return;
    const row = selectedRow;
    setUsing(true);
    setToastError(false);

    try {
      const data = await useInventoryItem(row.id);
      const message = buildInventoryUseSuccessMessage(row, data);

      if (data?.user) {
        mergeQuestGameSnapshotIntoMe?.(data);
      }
      if (isFatigueRecoveryItem(row)) {
        await refreshMe?.();
      }

      setRows((prev) => applyInventoryResponse(prev, data));
      setToast(message);
      setSelectedRow(null);
      if (!Array.isArray(data?.inventory)) {
        await load();
      }
    } catch (err) {
      if (err?.status === 404 && isDevMockAuthEnabled()) {
        const mock = applyDevMockUse(row, me, mergeQuestGameSnapshotIntoMe);
        setRows(mock.rowsUpdater);
        if (mock.needsRefreshMe) {
          await refreshMe?.();
        }
        setToast(mock.message);
        setSelectedRow(null);
      } else {
        setToast(inventoryUseErrorMessage(err));
        setToastError(true);
      }
    } finally {
      setUsing(false);
    }
  };

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
          {slots.map((cell, idx) => {
            if (!cell) {
              return (
                <div key={idx} className="inv-slot inv-slot--empty" title="빈 칸" aria-hidden />
              );
            }
            return (
              <button
                key={cell.id ?? idx}
                type="button"
                className="inv-slot inv-slot--filled inv-slot-btn"
                title={`${cell.name} ×${cell.quantity}`}
                onClick={() => setSelectedRow(cell)}
              >
                <div className="inv-slot-icon-wrap">
                  <SlotIcon imageUrl={cell.imageUrl} iconEmoji={cell.iconEmoji} />
                </div>
                {cell.quantity > 1 ? <span className="inv-qty">{cell.quantity}</span> : null}
              </button>
            );
          })}
        </div>

        {!error && rows.length === 0 ? (
          <p className="inventory-placeholder">아직 보유한 아이템이 없습니다. 상점에서 구매해 보세요.</p>
        ) : null}
      </main>
      <BottomNav />

      <InventoryItemModal
        open={Boolean(selectedRow)}
        item={selectedRow}
        using={using}
        onClose={closeModal}
        onUse={handleUse}
      />

      <BriefMessageModal
        message={toast}
        variant={toastError ? 'error' : 'success'}
        onClose={clearToast}
      />
    </div>
  );
};

export default InventoryPage;
