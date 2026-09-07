-- P3's seller self-service edit flow: editing an already-live self-listed
-- bike can opt into certification. That creates a fresh sell_submissions
-- row (chosen_path: 'certify') that feeds the P2 consignment worksheet
-- exactly like a new Sell Yours submission would, but the original bike
-- stays live and self-listed until admin starts the worksheet — it just
-- needs a flag so the seller's own listings page can show "pending
-- certification" on it.
alter table public.bikes
  add column pending_certification boolean not null default false;
