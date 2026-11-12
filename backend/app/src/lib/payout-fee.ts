/**
 * The platform fee: PiațăRo's cut of a paid order (corpus decisions.md). One constant; an order
 * records its fee when it is paid, so changing this never touches past orders.
 */
export const PLATFORM_FEE_RATE = 0.025;

/** The fee and the seller's net for an order amount, in RON, the fee rounded to the ban (half up). */
export function splitOrderAmount(
  amountRon: number,
  rate: number = PLATFORM_FEE_RATE,
): { feeRon: number; netRon: number } {
  const amountBani = Math.round(amountRon * 100);
  const feeBani = Math.round(amountBani * rate + 1e-9);
  return { feeRon: feeBani / 100, netRon: (amountBani - feeBani) / 100 };
}
