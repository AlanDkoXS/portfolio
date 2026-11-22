// tilt.js
// Shared device-tilt source for the effects that follow the phone (background
// parallax, portrait parallax, hanging lamp): ONE deviceorientation listener
// and ONE requestAnimationFrame loop, whatever the number of subscribers.
// - Tilt is relative to how the user holds the phone (baseline), not absolute.
// - After the phone stays still for `idleMs`, the baseline drifts toward the
//   current reading so layers return to center instead of staying offset.
// - Values are clamped and smoothed once per animation frame.
// - Each subscriber is called on every frame while it's active; the loop only
//   runs while some subscriber is active (and, like any requestAnimationFrame
//   loop, not while the page is hidden). A `follow` subscriber also gets the
//   frames while it's inactive, as long as the loop runs for another one, so
//   state of its own (the lamp's pendulum) stays continuous.

const CONFIG = {
  maxTilt: 20, // degrees, clamps gamma/beta deltas
  smoothing: 0.06, // 0..1, lerp factor per frame (lower = softer)
  recenter: {
    idleMs: 2000, // phone still this long → drift back to center
    motionThreshold: 1.5, // degrees of change that count as "moving"
    speed: 0.03, // 0..1, how fast the baseline catches up per frame
  },
};

// After a pause with no active subscriber, the frames it missed are replayed
// (at most this many: by then the smoothing has long settled)
const FRAME_MS = 1000 / 60;
const MAX_CATCH_UP_FRAMES = 300;

let permissionRequested = false;

// iOS 13+ only fires deviceorientation after permission is granted inside a
// user gesture. Safe to call many times; it only wires the listener once.
function requestTiltPermission() {
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

// ---- the tracker (one per page)
const s = {
  rawGamma: 0,
  rawBeta: 0,
  baseGamma: null,
  baseBeta: null,
  lastMotionTime: 0,
  value: { gamma: 0, beta: 0 },
};

const clamp = (v) => Math.max(-CONFIG.maxTilt, Math.min(CONFIG.maxTilt, v));

// What a frame reads from the readings (see the catch-up below)
const reading = () => ({ rawGamma: s.rawGamma, rawBeta: s.rawBeta, lastMotionTime: s.lastMotionTime });

// While the loop is stopped, every reading is logged with its time: when it
// starts again, the frames it missed are replayed with the readings each of
// them would have seen, so the values are the same as if it had kept running
let pause = null; // { from: reading when it stopped, baseless, log: [{ t, reading, setsBase }] }

function onOrientation(event) {
  if (event.gamma === null || event.beta === null) return;

  const setsBase = s.baseBeta === null;
  if (setsBase) {
    s.baseGamma = event.gamma;
    s.baseBeta = event.beta;
    s.lastMotionTime = performance.now();
  }

  const { motionThreshold } = CONFIG.recenter;
  if (
    Math.abs(event.gamma - s.rawGamma) > motionThreshold ||
    Math.abs(event.beta - s.rawBeta) > motionThreshold
  ) {
    s.lastMotionTime = performance.now();
  }

  s.rawGamma = event.gamma;
  s.rawBeta = event.beta;
  if (pause) logReading(performance.now(), setsBase);
}

// Readings older than the replayed frames (plus a margin of two frames) are
// folded into `from` as they age: catchUp would apply them all before its
// first frame anyway, and the log stays at ~5 s however long the pause lasts
function logReading(now, setsBase) {
  const { log } = pause;
  log.push({ t: now, reading: reading(), setsBase });
  const oldest = now - (MAX_CATCH_UP_FRAMES + 2) * FRAME_MS;
  let n = 0;
  for (; n < log.length && log[n].t < oldest; n++) {
    pause.from = log[n].reading;
    if (log[n].setsBase) pause.baseless = false;
  }
  if (n) log.splice(0, n);
}

/** Advances one frame; returns the smoothed tilt { gamma, beta } in degrees. */
function update(now) {
  if (s.baseBeta === null) return s.value;

  const { idleMs, speed } = CONFIG.recenter;
  if (now - s.lastMotionTime >= idleMs) {
    s.baseGamma += (s.rawGamma - s.baseGamma) * speed;
    s.baseBeta += (s.rawBeta - s.baseBeta) * speed;
  }

  const k = CONFIG.smoothing;
  s.value.gamma += (clamp(s.rawGamma - s.baseGamma) - s.value.gamma) * k;
  s.value.beta += (clamp(s.rawBeta - s.baseBeta) - s.value.beta) * k;
  return s.value;
}

// ---- the loop
const subscribers = new Set();
let frameId = 0;
let lastFrame = null; // timestamp of the last frame (or of the first subscription)

const anyActive = () => [...subscribers].some((sub) => sub.active);
const followers = () => [...subscribers].filter((sub) => sub.follow);

const stop = () => {
  pause = { from: reading(), baseless: s.baseBeta === null, log: [] };
};

// The frames missed while stopped (at most the last MAX_CATCH_UP_FRAMES: older
// ones no longer show in the smoothed value), for the tracker and the
// `follow` subscribers, each with the readings it would have seen
function catchUp(now) {
  const { from, baseless, log } = pause;
  pause = null;
  const latest = reading();
  const base = { gamma: s.baseGamma, beta: s.baseBeta };
  Object.assign(s, from);
  if (baseless) s.baseBeta = null;
  const subs = followers();
  let next = 0;
  const frames = Math.floor((now - lastFrame) / FRAME_MS - 0.5);
  for (let i = Math.max(1, frames - MAX_CATCH_UP_FRAMES + 1); i <= frames; i++) {
    const t = lastFrame + i * FRAME_MS;
    // (a reading taken at a frame's own time belongs to the next frame: the
    // margin absorbs the rounding of the computed frame times)
    for (; next < log.length && log[next].t < t - 0.001; next++) {
      Object.assign(s, log[next].reading);
      if (log[next].setsBase) [s.baseGamma, s.baseBeta] = [base.gamma, base.beta];
    }
    const value = update(t);
    for (const sub of subs) sub.onFrame(value, t, false);
  }
  Object.assign(s, latest);
  if (s.baseBeta === null && base.beta !== null) [s.baseGamma, s.baseBeta] = [base.gamma, base.beta];
}

function tick(now) {
  frameId = 0;
  if (!anyActive()) {
    stop();
    return;
  }
  if (pause) catchUp(now);
  lastFrame = now;
  const value = update(now);
  for (const sub of [...subscribers]) {
    if (sub.active || sub.follow) sub.onFrame(value, now, sub.active);
  }
  frameId = requestAnimationFrame(tick);
}

function run() {
  if (!frameId && anyActive()) frameId = requestAnimationFrame(tick);
}

let listening = false;

/**
 * Follows the device tilt: `onFrame({ gamma, beta }, now, active)` is called
 * once per animation frame (smoothed tilt in degrees, clamped to ±20) while
 * the subscription is active (or, with `follow`, while the loop runs). The
 * value object is shared: read it, don't keep it.
 * @param {(tilt: { gamma: number, beta: number }, now: number, active: boolean) => void} onFrame
 * @param {{ active?: boolean, follow?: boolean }} [options] active: false
 *   starts paused; follow: true keeps getting the frames while paused (without
 *   keeping the loop running)
 * @returns {{ setActive: (active: boolean) => void, unsubscribe: () => void }}
 */
export function subscribeTilt(onFrame, { active = true, follow = false } = {}) {
  if (!listening) {
    listening = true;
    lastFrame = performance.now();
    stop(); // until the first frame
    window.addEventListener('deviceorientation', onOrientation);
    requestTiltPermission();
  }

  const sub = { onFrame, active, follow };
  subscribers.add(sub);
  run();

  return {
    setActive(value) {
      sub.active = value;
      run();
    },
    unsubscribe() {
      subscribers.delete(sub);
    },
  };
}
