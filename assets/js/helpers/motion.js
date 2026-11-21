// true when the user's system asks for reduced motion.
// Decorative effects (parallax, gyroscope, snow) don't start in that case.
export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
