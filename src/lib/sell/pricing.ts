// Mirrors commercial-model.md exactly — do not alter without updating that
// file too.
export const SELF_LISTING_FEE = 99;

/** Self path: net = asking price − the flat one-time listing fee. */
export function computeSelfNet(askingPrice: number): number {
  return askingPrice - SELF_LISTING_FEE;
}
