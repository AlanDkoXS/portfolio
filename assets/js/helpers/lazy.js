// Helpers that are not needed on the first paint are downloaded on demand with
// a dynamic import(): when the browser is idle, when their section gets near
// or when they are first used. The first load fetches less JavaScript.

/**
 * Runs `fn` when the main thread is idle (at the latest after `timeout` ms);
 * browsers without requestIdleCallback (Safari) run it shortly after.
 */
export function onIdle(fn, timeout = 2000) {
  if ('requestIdleCallback' in window) requestIdleCallback(() => fn(), { timeout });
  else setTimeout(fn, 200);
}

/**
 * Imports a helper module and starts it. Like the eager steps, an error
 * (download or start) is reported under `name` and doesn't affect any other
 * step. Resolves with what `start` returns, or undefined after an error.
 * @param {string} name
 * @param {() => Promise<object>} importer `() => import('./helper.js')`
 * @param {(module: object) => unknown} start
 */
export function loadStep(name, importer, start) {
  return importer()
    .then(start)
    .catch((error) => console.error(`Error in ${name}:`, error));
}
