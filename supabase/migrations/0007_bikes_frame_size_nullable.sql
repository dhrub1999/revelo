-- P3's Sell Yours fork (brand/model/year/km/type) never collects frame size,
-- but P2's moderation "Approve" creates the live bikes row straight from a
-- sell_submissions row and is a single click, not a form. frame_size has to
-- be fillable afterwards via admin's Edit screen instead of blocking Approve.
alter table public.bikes
  alter column frame_size drop not null;
