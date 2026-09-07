-- Demo data for P4: a real conversation on rahul.demo@'s self-listed
-- "Urban+" so the buyer-facing chat thread (built now, per
-- P4-contact-scheduling.md) has something to show instead of starting from
-- zero. Requires 05_demo_seller_bikes.sql and 06_demo_buyer.sql to have run
-- first. Never run this against a real/production project.

insert into public.conversations (bike_id, buyer_id)
select b.id, u.id
from public.bikes b
join auth.users seller on seller.id = b.seller_id
cross join auth.users u
where seller.email = 'rahul.demo@example.com'
  and u.email = 'ananya.demo@example.com'
  and b.listing_type = 'self'
  and b.model = 'Urban+'
on conflict (bike_id, buyer_id) do nothing;

insert into public.messages (conversation_id, sender_role, body, created_at)
select c.id, m.sender_role, m.body, now() - m.age
from public.conversations c
join public.bikes b on b.id = c.bike_id
join auth.users seller on seller.id = b.seller_id
join auth.users buyer on buyer.id = c.buyer_id
cross join (values
  ('buyer', 'Hi, is this still available? Would love to see it this week.', interval '2 hours'),
  ('seller_mock', 'Hey! Thanks for reaching out — yes, it''s still available!', interval '110 minutes')
) as m(sender_role, body, age)
where seller.email = 'rahul.demo@example.com'
  and buyer.email = 'ananya.demo@example.com'
  and b.model = 'Urban+';

insert into public.notifications (recipient_role, recipient_id, type, body)
select 'seller', b.seller_id, 'new_message',
  'New message about your ' || b.brand || ' ' || b.model || '.'
from public.conversations c
join public.bikes b on b.id = c.bike_id
join auth.users buyer on buyer.id = c.buyer_id
where buyer.email = 'ananya.demo@example.com'
  and b.model = 'Urban+';
