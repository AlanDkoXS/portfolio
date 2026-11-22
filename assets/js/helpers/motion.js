// The user's system asks for reduced motion.
// Decorative effects (parallax, gyroscope, snow) don't start in that case.
export const reducedMotionQuery = () => window.matchMedia('(prefers-reduced-motion: reduce)');

export const prefersReducedMotion = () => reducedMotionQuery().matches;

// Seasonal snow period: December 12 to January 6 (local date). The single
// source of the rule: common.js only downloads snow-effect.js inside it.
export function isSnowSeason(date = new Date()) {
  const month = date.getMonth(); // 0-11
  const day = date.getDate();
  return (month === 11 && day >= 12) || (month === 0 && day <= 6);
}
