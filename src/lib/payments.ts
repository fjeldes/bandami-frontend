const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function redirectToCheckout(planSlug: string, discountPercent?: number) {
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
  if (discountPercent) body.discount_percent = discountPercent;

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

  const { url } = await res.json();
  window.location.href = url;
}
