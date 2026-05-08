import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/RouteLoadingOverlay.css';

const SHOW_MS = 3000;
const FADE_MS = 320;

export default function RouteLoadingOverlay() {
  const location = useLocation();
  const didMountRef = useRef(false);
  const prevPathRef = useRef(null);
  const timersRef = useRef([]);
  const [phase, setPhase] = useState('hidden'); // hidden | entering | shown | fading

  useEffect(() => {
    // Clear any previous timers whenever the route changes.
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];

    // Skip initial mount; only show on specific transitions.
    if (!didMountRef.current) {
      didMountRef.current = true;
      prevPathRef.current = location.pathname;
      return;
    }

    const prevPath = prevPathRef.current;
    const nextPath = location.pathname;
    prevPathRef.current = nextPath;

    const shouldContinueLoginToHome =
      prevPath === '/login' &&
      (nextPath === '/home' || nextPath.startsWith('/home/')) &&
      Boolean(location.state?.loginLoadingTransition);

    const shouldContinueLogoutToLogin =
      prevPath !== '/login' &&
      nextPath === '/login' &&
      Boolean(location.state?.logoutLoadingTransition);

    const shouldShow = shouldContinueLoginToHome || shouldContinueLogoutToLogin;

    if (shouldShow) {
      const startedAt = Number(
        location.state?.loginLoadingStartedAt ?? location.state?.logoutLoadingStartedAt ?? Date.now()
      );
      const elapsed = Date.now() - startedAt;
      const remainingShownMs = Math.max(0, SHOW_MS - FADE_MS - elapsed);

      setPhase('shown');
      timersRef.current.push(
        setTimeout(() => setPhase('fading'), remainingShownMs),
        setTimeout(() => setPhase('hidden'), remainingShownMs + FADE_MS)
      );
    }

    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, [location.key, location.pathname]);

  if (phase === 'hidden') return null;

  const className = [
    'route-loading-overlay',
    phase === 'entering' ? 'route-loading-overlay--entering' : '',
    phase === 'shown' ? 'route-loading-overlay--shown' : '',
    phase === 'fading' ? 'route-loading-overlay--fading' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className} aria-live="polite" aria-label="Loading">
      <div className="route-loading-overlay__content">
        <div className="route-loading-overlay__spinner" aria-hidden="true" />
        <div className="route-loading-overlay__text">Loading..</div>
      </div>
    </div>
  );
}
