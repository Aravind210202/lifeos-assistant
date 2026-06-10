import { useRef } from 'react';

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 80 }: { onSwipeLeft?: () => void; onSwipeRight?: () => void; threshold?: number } = {}) {
  const s = useRef({ x: 0, y: 0, dx: 0, lock: null as null | 'x' | 'y', el: null as HTMLElement | null });

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    s.current = { x: e.clientX, y: e.clientY, dx: 0, lock: null, el: e.currentTarget };
    e.currentTarget.style.transition = 'none';
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const c = s.current;
    if (!c.el) return;
    const mx = e.clientX - c.x;
    const my = e.clientY - c.y;
    if (c.lock === null) c.lock = Math.abs(mx) > Math.abs(my) ? 'x' : 'y';
    if (c.lock === 'y') return;
    c.dx = mx;
    c.el.style.transform = `translateX(${mx}px)`;
  };

  const onPointerUp = () => {
    const c = s.current;
    if (!c.el) return;
    c.el.style.transition = 'transform var(--t-base) var(--ease-out)';
    if (c.dx < -threshold) onSwipeLeft?.();
    else if (c.dx > threshold) onSwipeRight?.();
    c.el.style.transform = 'translateX(0)';
    c.el = null;
  };

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp };
}
