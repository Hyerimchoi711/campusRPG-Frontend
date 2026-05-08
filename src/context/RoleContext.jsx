import React, {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react';

const ROLE_KEY = 'campusRpg_role';
const STORAGE_EVENT = 'storage';

function snapshotRole() {
  try {
    if (import.meta.env.VITE_DEV_ADMIN === 'true') return 'admin';
    return localStorage.getItem(ROLE_KEY) === 'admin' ? 'admin' : 'user';
  } catch {
    return 'user';
  }
}

function subscribeRole(onStoreChange) {
  const onStorage = (e) => {
    if (e.key === ROLE_KEY || e.key === null) onStoreChange();
  };
  window.addEventListener(STORAGE_EVENT, onStorage);
  return () => window.removeEventListener(STORAGE_EVENT, onStorage);
}

const RoleContext = createContext(null);

export const RoleProvider = ({ children }) => {
  const role = useSyncExternalStore(subscribeRole, snapshotRole, snapshotRole);

  const value = useMemo(
    () => ({
      role,
      isAdmin: role === 'admin',
    }),
    [role]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
