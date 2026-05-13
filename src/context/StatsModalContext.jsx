import React, { createContext, useContext, useMemo, useState } from 'react';
import StatsModal from '../components/StatsModal';

const StatsModalContext = createContext(null);

export function StatsModalProvider({ children }) {
  const [open, setOpen] = useState(false);

  const value = useMemo(
    () => ({
      statsOpen: open,
      openStats: () => setOpen(true),
      closeStats: () => setOpen(false),
    }),
    [open]
  );

  return (
    <StatsModalContext.Provider value={value}>
      {children}
      <StatsModal open={open} onClose={() => setOpen(false)} />
    </StatsModalContext.Provider>
  );
}

export function useStatsModal() {
  const ctx = useContext(StatsModalContext);
  if (!ctx) {
    throw new Error('useStatsModal must be used within StatsModalProvider');
  }
  return ctx;
}
