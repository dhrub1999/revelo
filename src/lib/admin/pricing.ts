import { COMPS_WINDOW_DAYS, DEFAULT_COMPS_SAMPLE_SIZE } from "@/lib/comps";

// Mirrors commercial-model.md exactly — do not alter the rate here without
// updating that file too.
export const COMMISSION_RATE = 0.08;
export const STANDARD_INSPECTION_POINTS = 42;
// P3's comp table (src/lib/comps.ts) now backs the sell-yours quote; a
// worksheet started from a submission that matched no comp table entry
// falls back to this sample size, re-exported here for admin/actions.ts.
export const COMPS_SAMPLE_SIZE = DEFAULT_COMPS_SAMPLE_SIZE;
export { COMPS_WINDOW_DAYS };

export interface CertifiedPayout {
  commissionAmount: number;
  repairDeduction: number;
  sellerPayout: number;
}

/**
 * Repairs are a gate, not a note (data-model.md): the deduction only counts
 * once the seller has approved the repair cost. Recomputed live wherever
 * list price, repair cost, or the approval toggle changes.
 */
export function computeCertifiedPayout({
  listPrice,
  repairCost,
  sellerApproved,
}: {
  listPrice: number;
  repairCost: number;
  sellerApproved: boolean;
}): CertifiedPayout {
  const commissionAmount = Math.round(listPrice * COMMISSION_RATE);
  const repairDeduction = sellerApproved ? repairCost : 0;
  const sellerPayout = listPrice - commissionAmount - repairDeduction;
  return { commissionAmount, repairDeduction, sellerPayout };
}
