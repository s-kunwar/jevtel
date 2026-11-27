let lastHapticAt = 0;

/**
 * Fires subtle, restrained tactile feedback on Android/Chrome mobile browsers
 * while gracefully no-oping on unsupported devices or when muted/reduced motion.
 */
export function triggerHaptic(
  pattern: number | number[] = 12,
  muted = false
): void {
  if (muted || typeof window === 'undefined' || typeof navigator === 'undefined') {
    return;
  }
  if (typeof navigator.vibrate !== 'function') {
    return;
  }
  const prefersReduced =
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  if (prefersReduced) {
    return;
  }
  const now = performance.now();
  if (now - lastHapticAt < 38) {
    return;
  }
  lastHapticAt = now;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Ignore security/browser vibration restrictions
  }
}
