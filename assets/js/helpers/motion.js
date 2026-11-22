// The user's system asks for reduced motion.
// Decorative effects (parallax, gyroscope, snow) don't start in that case.
export const reducedMotionQuery = () => window.matchMedia('(prefers-reduced-motion: reduce)');

export const prefersReducedMotion = () => reducedMotionQuery().matches;
