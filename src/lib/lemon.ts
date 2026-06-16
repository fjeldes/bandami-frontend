/**
 * LemonSqueezy.js — open checkout overlay.
 * Uses Lemon.js CDN script (no npm package needed, 2.3kB).
 */
let lemonReady: Promise<void> | null = null;

function loadLemonJS(): Promise<void> {
  if (!lemonReady) {
    lemonReady = new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as any).LemonSqueezy) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://app.lemonsqueezy.com/js/lemon.js";
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }
  return lemonReady;
}

export async function openLemonCheckout(checkoutUrl: string) {
  await loadLemonJS();
  if (typeof window !== "undefined") {
    (window as any).LemonSqueezy?.Url?.Open(checkoutUrl);
  }
}
