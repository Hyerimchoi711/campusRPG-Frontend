import React, { useState, useEffect } from 'react';

/**
 * 말풍선용 한 줄씩 타이핑 (줄 사이 짧은 휴지)
 * @param {{ text: string, className?: string }[]} lines
 */
export default function TypewriterSpeech({
  lines,
  charMs = 28,
  linePauseMs = 400,
  startDelayMs = 120,
}) {
  const [parts, setParts] = useState(() => lines.map(() => ''));

  useEffect(() => {
    setParts(lines.map(() => ''));
    let lineIdx = 0;
    let charIdx = 0;
    let timeoutId;
    let cancelled = false;

    const schedule = (fn, delay) => {
      timeoutId = window.setTimeout(() => {
        if (!cancelled) fn();
      }, delay);
    };

    const step = () => {
      if (cancelled) return;
      const full = lines[lineIdx]?.text ?? '';
      if (charIdx < full.length) {
        setParts((prev) => {
          const next = [...prev];
          next[lineIdx] = full.slice(0, charIdx + 1);
          return next;
        });
        charIdx += 1;
        schedule(step, charMs);
      } else if (lineIdx < lines.length - 1) {
        lineIdx += 1;
        charIdx = 0;
        schedule(step, linePauseMs);
      }
    };

    schedule(step, startDelayMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [lines, charMs, linePauseMs, startDelayMs]);

  const activeLineIndex = parts.findIndex(
    (p, i) => p.length < (lines[i]?.text?.length ?? 0)
  );

  return (
    <>
      {lines.map((line, i) => (
        <p key={i} className={line.className}>
          {parts[i]}
          {activeLineIndex === i ? (
            <span className="typewriter-cursor" aria-hidden="true">
              ▍
            </span>
          ) : null}
        </p>
      ))}
    </>
  );
}
