const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function redirectToCheckout(planSlug: string) {
  const accessToken = sessionStorage.getItem("access_token");
  if (!accessToken) {
    window.location.href = `/register?plan=${planSlug}`;
    return;
  }

  const body: Record<string, any> = {
    plan_slug: planSlug,
    success_url: `${window.location.origin}/settings?checkout=success`,
    cancel_url: `${window.location.origin}/pricing`,
  };

  const res = await fetch(`${API_BASE}/payments/create-checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create checkout session");
  }

  const data = await res.json();

  // Paddle: use overlay checkout
  if (data.transaction_id) {
    const { openPaddleCheckout } = await import("./paddle");
    await openPaddleCheckout(
      data.transaction_id,
      `${window.location.origin}/settings?checkout=success`,
    );
    return;
  }

  // Fallback: redirect-based checkout (Flow, Stripe)
  window.location.href = data.url;
}
