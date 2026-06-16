/**
 * LemonSqueezy checkout — opens hosted checkout page via overlay or redirect.
 */
let lemonLoaded = false;

function loadLemonJS(): void {
  if (lemonLoaded || typeof window === "undefined") return;
  lemonLoaded = true;
  const script = document.createElement("script");
  script.src = "https://assets.lemonsqueezy.com/lemon.js";
  script.onload = () => {
    // Lemon.js is loaded — future calls to openLemonCheckout will use overlay
  };
  script.onerror = () => {
    lemonLoaded = false;
  };
  document.head.appendChild(script);
}

// Preload Lemon.js early (non-blocking)
loadLemonJS();

export function openLemonCheckout(checkoutUrl: string) {
  if (typeof window === "undefined") return;
  const LS = (window as any).LemonSqueezy;
  if (LS?.Url?.Open) {
    LS.Url.Open(checkoutUrl);
    return;
  }
  // Fallback: redirect to hosted checkout page
  window.open(checkoutUrl, "_blank");
}
