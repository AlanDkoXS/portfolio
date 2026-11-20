// tilt.js
// Shared device-tilt tracker for the parallax effects.
// - Tilt is relative to how the user holds the phone (baseline), not absolute.
// - After the phone stays still for `idleMs`, the baseline drifts toward the
//   current reading so layers return to center instead of staying offset.
// - Values are clamped and smoothed; call `update()` once per animation frame.

const DEFAULTS = {
  maxTilt: 45, // degrees, clamps gamma/beta deltas
  smoothing: 0.15, // 0..1, lerp factor per frame
  recenter: {
    idleMs: 2000, // phone still this long → drift back to center
    motionThreshold: 1.5, // degrees of change that count as "moving"
    speed: 0.03, // 0..1, how fast the baseline catches up per frame
  },
};

let permissionRequested = false;

// iOS 13+ only fires deviceorientation after permission is granted inside a
// user gesture. Safe to call many times; it only wires the listener once.
export function requestTiltPermission() {
  if (permissionRequested) return;
  permissionRequested = true;

  if (
    typeof DeviceOrientationEvent === 'undefined' ||
    typeof DeviceOrientationEvent.requestPermission !== 'function'
  ) {
    return;
  }

  const ask = () => {
    DeviceOrientationEvent.requestPermission()
      .catch(() => 'denied')
      .finally(() => {
        document.removeEventListener('click', ask);
        document.removeEventListener('touchend', ask);
      });
  };

  document.addEventListener('click', ask);
  document.addEventListener('touchend', ask);
}

export function createTilt(options = {}) {
  const cfg = {
    ...DEFAULTS,
    ...options,
    recenter: { ...DEFAULTS.recenter, ...options.recenter },
  };

  const s = {
    rawGamma: 0,
    rawBeta: 0,
    baseGamma: null,
    baseBeta: null,
    lastMotionTime: 0,
    value: { gamma: 0, beta: 0 },
  };

  const clamp = (v) => Math.max(-cfg.maxTilt, Math.min(cfg.maxTilt, v));

  window.addEventListener('deviceorientation', (event) => {
    if (event.gamma === null || event.beta === null) return;

    if (s.baseBeta === null) {
      s.baseGamma = event.gamma;
      s.baseBeta = event.beta;
      s.lastMotionTime = performance.now();
    }

    const { motionThreshold } = cfg.recenter;
    if (
      Math.abs(event.gamma - s.rawGamma) > motionThreshold ||
      Math.abs(event.beta - s.rawBeta) > motionThreshold
    ) {
      s.lastMotionTime = performance.now();
    }

    s.rawGamma = event.gamma;
    s.rawBeta = event.beta;
  });

  requestTiltPermission();

  return {
    /** Advance one frame; returns the smoothed tilt { gamma, beta } in degrees. */
    update(now = performance.now()) {
      if (s.baseBeta === null) return s.value;

      const { idleMs, speed } = cfg.recenter;
      if (now - s.lastMotionTime >= idleMs) {
        s.baseGamma += (s.rawGamma - s.baseGamma) * speed;
        s.baseBeta += (s.rawBeta - s.baseBeta) * speed;
      }

      const k = cfg.smoothing;
      s.value.gamma += (clamp(s.rawGamma - s.baseGamma) - s.value.gamma) * k;
      s.value.beta += (clamp(s.rawBeta - s.baseBeta) - s.value.beta) * k;
      return s.value;
    },
  };
}
