const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function redirectToCheckout(planSlug: string) {
  const accessToken = sessionStorage.getItem("access_token");
  if (!accessToken) {
    window.location.href = `/register?plan=${planSlug}`;
    return;
  }

  const res = await fetch(`${API_BASE}/payments/create-checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      plan_slug: planSlug,
      success_url: `${window.location.origin}/settings?checkout=success`,
      cancel_url: `${window.location.origin}/pricing`,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to create checkout session");
  }

  const { url } = await res.json();
  window.location.href = url;
}
