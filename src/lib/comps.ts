// The "small hardcoded comp table" called for in
// P3-sell-yours-seller-portal.md: no real comps engine exists. Keyed by
// brand/model — if a combination isn't listed here, the comps panel (and
// anything downstream of it) must be suppressed rather than fake a number.
//
// Ranges are hand-picked to roughly bracket the matching demo bikes/
// submissions in supabase/seed/, so the demo data tells a consistent story
// (e.g. the Motovolt Kivo submission's ₹44,900 asking price sits above its
// comp range, matching its "price out of range" moderation flag).
//
// The EMotorad T-Rex+ entry uses the exact figures from the reference
// wireframe's own worked example (README.md screens 5 and 11).

export const COMPS_WINDOW_DAYS = 90;
export const DEFAULT_COMPS_SAMPLE_SIZE = 14;

export interface CompEntry {
  low: number;
  high: number;
  sampleSize: number;
}

const COMP_TABLE: Record<string, CompEntry> = {
  "emotorad|t-rex+": { low: 31000, high: 36500, sampleSize: 14 },
  "emotorad|t-rex": { low: 13500, high: 16500, sampleSize: 11 },
  "emotorad|doodle": { low: 28000, high: 34000, sampleSize: 12 },
  "emotorad|x1": { low: 52000, high: 58000, sampleSize: 13 },
  "motovolt|hum": { low: 37000, high: 44000, sampleSize: 15 },
  "motovolt|kivo": { low: 36000, high: 41500, sampleSize: 12 },
  "motovolt|urban+": { low: 25000, high: 30000, sampleSize: 13 },
  "hero lectro|f6i": { low: 19000, high: 24000, sampleSize: 16 },
  "hero lectro|c5": { low: 15000, high: 19000, sampleSize: 11 },
  "ninety one|meraki": { low: 34000, high: 40000, sampleSize: 12 },
  "ninety one|rider+": { low: 33000, high: 39000, sampleSize: 14 },
  "ninety one|emerge": { low: 28000, high: 33000, sampleSize: 13 },
  "nexzu|roadlark": { low: 23000, high: 27500, sampleSize: 15 },
  "ampere|reo+": { low: 18000, high: 22000, sampleSize: 14 },
  "ampere|magnus": { low: 19000, high: 23000, sampleSize: 12 },
  "okinawa|ridge+": { low: 29000, high: 34500, sampleSize: 13 },
  "revolt|rv400": { low: 35000, high: 41000, sampleSize: 16 },
};

function key(brand: string, model: string): string {
  return `${brand.trim().toLowerCase()}|${model.trim().toLowerCase()}`;
}

/** null means "no comp data for this combination" — suppress the panel, never fake a number. */
export function getComps(brand: string, model: string): CompEntry | null {
  if (!brand.trim() || !model.trim()) return null;
  return COMP_TABLE[key(brand, model)] ?? null;
}
