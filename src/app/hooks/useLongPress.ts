import { PointerEventHandler, useCallback, useMemo, useRef } from 'react';

export type LongPressCoords = {
  x: number;
  y: number;
  target: EventTarget | null;
};

export type LongPressHandlers = {
  onPointerDown: PointerEventHandler;
  onPointerMove: PointerEventHandler;
  onPointerUp: PointerEventHandler;
  onPointerLeave: PointerEventHandler;
  onPointerCancel: PointerEventHandler;
};

type LongPressOptions = {
  thresholdMs?: number;
  // Cancel the long-press if the pointer travels further than this (px).
  // Lets the user scroll the timeline without triggering it.
  moveTolerance?: number;
};

/**
 * Touch long-press detection.
 *
 * Only engages for `touch` pointers, so mouse/right-click behaviour on the
 * desktop is left untouched. Cancels on scroll/drag (movement beyond
 * `moveTolerance`) or when the finger is lifted before `thresholdMs`.
 */
export const useLongPress = (
  callback: (coords: LongPressCoords) => void,
  { thresholdMs = 500, moveTolerance = 10 }: LongPressOptions = {}
): LongPressHandlers => {
  const timeoutRef = useRef<number>();
  const startRef = useRef<{ x: number; y: number; target: EventTarget | null } | null>(null);

  const clear = useCallback(() => {
    if (timeoutRef.current !== undefined) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    startRef.current = null;
  }, []);

  return useMemo<LongPressHandlers>(
    () => ({
      onPointerDown: (evt) => {
        if (evt.pointerType !== 'touch') return;
        const { clientX, clientY, target } = evt;
        startRef.current = { x: clientX, y: clientY, target };
        timeoutRef.current = window.setTimeout(() => {
          callback({ x: clientX, y: clientY, target });
          clear();
        }, thresholdMs);
      },
      onPointerMove: (evt) => {
        const start = startRef.current;
        if (!start) return;
        if (
          Math.abs(evt.clientX - start.x) > moveTolerance ||
          Math.abs(evt.clientY - start.y) > moveTolerance
        ) {
          clear();
        }
      },
      onPointerUp: clear,
      onPointerLeave: clear,
      onPointerCancel: clear,
    }),
    [callback, clear, thresholdMs, moveTolerance]
  );
};
