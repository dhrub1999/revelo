// Mirrors commercial-model.md exactly — do not alter the rate here without
// updating that file too.
export const COMMISSION_RATE = 0.08;
export const STANDARD_INSPECTION_POINTS = 42;
// No real comps engine exists yet (that's P3's "small hardcoded comp table").
// Every worksheet seeds the same sample window; only the range itself varies
// per submission's estimated_range_low/high.
export const COMPS_SAMPLE_SIZE = 14;
export const COMPS_WINDOW_DAYS = 90;

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
