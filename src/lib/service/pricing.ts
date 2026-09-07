// Prices per commercial-model.md — do not alter without checking that file.

export interface ServicePriceRow {
  label: string;
  price: string;
}

// The eight-row list on Screen 3 (services price list), published openly.
export const SERVICE_PRICE_LIST: ServicePriceRow[] = [
  { label: "Tune-up", price: "from ₹899" },
  { label: "Battery diagnostics", price: "from ₹499" },
  { label: "Brake service", price: "from ₹649" },
  { label: "Battery replacement", price: "from ₹7,500" },
  { label: "Motor repair", price: "from ₹2,400" },
  { label: "Firmware & diagnostics", price: "from ₹399" },
  { label: "Pickup & delivery", price: "₹250/way, free on annual plan" },
  { label: "Annual care plan", price: "₹4,999/year" },
];

// "What's wrong?" select on Screen 8's booking form — same categories, plus
// the pre-buy inspection and a catch-all for anything else.
export const SERVICE_ISSUE_OPTIONS = [
  "Tune-up",
  "Battery diagnostics",
  "Brake service",
  "Battery replacement",
  "Motor repair",
  "Firmware & diagnostics",
  "Pre-buy inspection",
  "Other",
] as const;

export interface ServiceQuickCategory {
  key: (typeof SERVICE_ISSUE_OPTIONS)[number];
  title: string;
  price: string;
}

// Screen 8's four highlighted category cards — a subset of the full price
// list, for quick booking.
export const SERVICE_QUICK_CATEGORIES: ServiceQuickCategory[] = [
  { key: "Tune-up", title: "Tune-up", price: "from ₹899" },
  { key: "Battery diagnostics", title: "Battery care", price: "from ₹499" },
  { key: "Motor repair", title: "Motor & drive", price: "from ₹2,400" },
  { key: "Pre-buy inspection", title: "Pre-buy inspection", price: "₹999 flat" },
];

export const ANNUAL_CARE_PLAN = {
  price: "₹4,999/year",
  perks: ["Two tune-ups a year", "Battery health report", "Free pickup & delivery"],
};
