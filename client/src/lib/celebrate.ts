/**
 * Celebration animation with checkmark, particles, and haptic feedback
 */
export function celebrate(container: HTMLElement) {
  // Haptic feedback on supporting devices
  if (navigator.vibrate) {
    navigator.vibrate(12);
  }

  const badge = document.createElement('div');
  badge.className = 'complete-badge';
  badge.innerHTML = '<svg viewBox="0 0 24 24" width="32" height="32"><path d="M5 13l4 4L19 7"/></svg>';
  container.appendChild(badge);

  // Create particle burst
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('span');
    p.className = 'particle';
    const a = (i / 12) * Math.PI * 2;
    const d = 40 + Math.random() * 30;
    p.style.setProperty('--tx', `${Math.cos(a) * d}px`);
    p.style.setProperty('--ty', `${Math.sin(a) * d}px`);
    badge.appendChild(p);
  }

  // Clean up after animation
  setTimeout(() => badge.remove(), 900);
}
