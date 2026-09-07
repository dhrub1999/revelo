-- P4: 0003_rls.sql only let a buyer insert their own sender_role='buyer'
-- messages. The canned seller reply (data-model.md: "seed a canned seller
-- reply after a short delay — there is no live second user session for the
-- seller side of chat") is triggered by the buyer's own client, so it needs
-- its own insert policy scoped to the buyer's own conversation.
create policy "messages_insert_seller_mock_own_conversation"
  on public.messages for insert
  with check (
    sender_role = 'seller_mock'
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.buyer_id = auth.uid()
    )
  );
