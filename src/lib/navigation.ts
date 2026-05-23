/** Call before `router.push` / `router.replace` so the global progress bar appears. */
export function startNavigation() {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.navigating = 'true';
  window.dispatchEvent(new CustomEvent('navigation:start'));
}
