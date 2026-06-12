import type { Environments, Paddle } from "@paddle/paddle-js";

const PADDLE_SELLER = 76754;

let paddle: Paddle | null = null;

export async function getPaddle(): Promise<Paddle> {
  if (paddle) return paddle;

  const { initializePaddle } = await import("@paddle/paddle-js");
  const env = (process.env.NEXT_PUBLIC_PADDLE_ENV || "sandbox") as Environments;
  const instance = await initializePaddle({
    seller: PADDLE_SELLER,
    environment: env,
  });
  paddle = instance ?? null;
  return paddle!;
}

export async function openPaddleCheckout(
  transactionId: string,
  successUrl?: string,
): Promise<void> {
  const p = await getPaddle();
  await p.Checkout.open({
    transactionId,
    settings: {
      displayMode: "overlay",
      successUrl,
    },
  });
}
