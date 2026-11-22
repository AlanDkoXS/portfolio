// Viewport and input facts shared by several helpers: the mobile/desktop
// breakpoint, the pointer type and the scrollbar width the CSS needs.

// First width (px) that gets the desktop layout; same value as the CSS
const MOBILE_BREAKPOINT = 600;

// Three ways of asking the same question, each kept where it was already used
// (they only disagree on fractional widths between 599 and 600):
export const desktopWidthQuery = () => window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px)`);
export const isMobileWidth = () => window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
export const isDesktopViewport = () => window.innerWidth >= MOBILE_BREAKPOINT;

// Touch devices (phones, tablets): they get tilt instead of mouse effects
export const coarsePointerQuery = () => window.matchMedia('(pointer: coarse)');
export const isCoarsePointer = () => coarsePointerQuery().matches;

// 100vw includes the scrollbar: its width goes in --scrollbar-w so the CSS can
// center the lamp (_lamp.css) and run the skills rows from edge to edge
// (_skills.css)
const setScrollbarWidth = () => {
  const width = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.setProperty('--scrollbar-w', `${width}px`);
};

let resizeBound = false;

// Measures now and on every resize. Each caller gets a fresh measurement, but
// the resize listener is registered only once per page.
export function trackScrollbarWidth() {
  setScrollbarWidth();
  if (resizeBound) return;
  resizeBound = true;
  window.addEventListener('resize', setScrollbarWidth);
}
