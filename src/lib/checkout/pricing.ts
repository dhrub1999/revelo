import type { Fulfillment, WarrantyTier } from "@/lib/supabase/types";

// Mirrors the constants baked into accept_offer() (0012_checkout_offer_fns.sql)
// for the offer-accept path, which has no live wizard to price things from.
export const DELIVERY_FEE = 250;
export const BUYER_PROTECTION_RATE = 0.015;
export const RESERVATION_AMOUNT = 2000;
export const EMI_MONTHS = 18;

export const WARRANTY_PRICES: Record<WarrantyTier, number> = {
  included: 0,
  extended_6mo: 3499,
  annual_care: 4999,
};

export const WARRANTY_LABELS: Record<WarrantyTier, { title: string; sub: string }> = {
  included: { title: "Included", sub: "3 months" },
  extended_6mo: { title: "Extend to 6", sub: "+₹3,499" },
  annual_care: { title: "Annual care", sub: "+₹4,999" },
};

export interface ReservationPricing {
  bikePrice: number;
  buyerProtectionFee: number;
  deliveryFee: number;
  warrantyFee: number;
  total: number;
  reservationAmount: number;
  balance: number;
  emiPerMonth: number;
}

export function computeReservationPricing(
  bikePrice: number,
  fulfillment: Fulfillment,
  warrantyTier: WarrantyTier,
): ReservationPricing {
  const buyerProtectionFee = Math.round(bikePrice * BUYER_PROTECTION_RATE);
  const deliveryFee = fulfillment === "delivery" ? DELIVERY_FEE : 0;
  const warrantyFee = WARRANTY_PRICES[warrantyTier];
  const total = bikePrice + buyerProtectionFee + deliveryFee + warrantyFee;
  const reservationAmount = Math.min(RESERVATION_AMOUNT, total);
  const balance = total - reservationAmount;
  const emiPerMonth = Math.round(balance / EMI_MONTHS);

  return {
    bikePrice,
    buyerProtectionFee,
    deliveryFee,
    warrantyFee,
    total,
    reservationAmount,
    balance,
    emiPerMonth,
  };
}

/** Next occurrence of the given weekday (0 = Sunday), at least a day out. */
export function nextWeekday(target: number): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  do {
    date.setDate(date.getDate() + 1);
  } while (date.getDay() !== target);
  return date;
}

const deliveryDateFormatter = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

/** A single mocked home-delivery slot — no real logistics scheduling. */
export function nextDeliverySlotLabel(): string {
  const thursday = nextWeekday(4);
  return `${deliveryDateFormatter.format(thursday)}, 10am–1pm`;
}
