// true cuando el sistema del usuario pide reducir el movimiento.
// Los efectos decorativos (parallax, giroscopio, nieve) no se inician en ese caso.
export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
