import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;
export type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];
export type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
export type TestRideRow = Database["public"]["Tables"]["test_rides"]["Row"];
export type BikeRow = Database["public"]["Tables"]["bikes"]["Row"];
export type OfferRow = Database["public"]["Tables"]["offers"]["Row"];

export interface ConversationThread {
  conversation: ConversationRow;
  bike: BikeRow;
  messages: MessageRow[];
}

export async function getConversationThread(
  supabase: Client,
  conversationId: string,
  buyerId: string,
): Promise<ConversationThread | null> {
  const { data: conversation, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .eq("buyer_id", buyerId)
    .maybeSingle();
  if (error) throw error;
  if (!conversation) return null;

  const [{ data: bike, error: bikeError }, { data: messages, error: messagesError }] =
    await Promise.all([
      supabase.from("bikes").select("*").eq("id", conversation.bike_id).single(),
      supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true }),
    ]);
  if (bikeError) throw bikeError;
  if (messagesError) throw messagesError;

  return { conversation, bike, messages: messages ?? [] };
}

export interface ConversationSummary {
  conversation: ConversationRow;
  bike: BikeRow;
  lastMessage: MessageRow | null;
}

export async function listMyConversations(
  supabase: Client,
  buyerId: string,
): Promise<ConversationSummary[]> {
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (!conversations || conversations.length === 0) return [];

  const bikeIds = conversations.map((c) => c.bike_id);
  const { data: bikes, error: bikesError } = await supabase
    .from("bikes")
    .select("*")
    .in("id", bikeIds);
  if (bikesError) throw bikesError;
  const bikesById = new Map((bikes ?? []).map((b) => [b.id, b]));

  const conversationIds = conversations.map((c) => c.id);
  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("*")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false });
  if (messagesError) throw messagesError;

  const lastMessageByConversation = new Map<string, MessageRow>();
  for (const message of messages ?? []) {
    if (!lastMessageByConversation.has(message.conversation_id)) {
      lastMessageByConversation.set(message.conversation_id, message);
    }
  }

  return conversations.flatMap((conversation) => {
    const bike = bikesById.get(conversation.bike_id);
    if (!bike) return [];
    return [
      {
        conversation,
        bike,
        lastMessage: lastMessageByConversation.get(conversation.id) ?? null,
      },
    ];
  });
}

export interface MyTestRide {
  testRide: TestRideRow;
  bike: BikeRow;
}

export async function listMyTestRides(supabase: Client, buyerId: string): Promise<MyTestRide[]> {
  const { data: rides, error } = await supabase
    .from("test_rides")
    .select("*")
    .eq("buyer_id", buyerId)
    .order("requested_slot", { ascending: true });
  if (error) throw error;
  if (!rides || rides.length === 0) return [];

  const bikeIds = Array.from(new Set(rides.map((r) => r.bike_id)));
  const { data: bikes, error: bikesError } = await supabase
    .from("bikes")
    .select("*")
    .in("id", bikeIds);
  if (bikesError) throw bikesError;
  const bikesById = new Map((bikes ?? []).map((b) => [b.id, b]));

  return rides.flatMap((testRide) => {
    const bike = bikesById.get(testRide.bike_id);
    if (!bike) return [];
    return [{ testRide, bike }];
  });
}

/** The buyer's own offer on this bike, if any — a bike only ever shows one
 *  active "Make an offer" state per buyer, so the detail page and the offer
 *  dialog both key off this instead of allowing duplicate submissions. */
export async function getMyOfferForBike(
  supabase: Client,
  bikeId: string,
  buyerId: string,
): Promise<OfferRow | null> {
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("bike_id", bikeId)
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export interface MyOffer {
  offer: OfferRow;
  bike: BikeRow;
}

export async function listMyOffers(supabase: Client, buyerId: string): Promise<MyOffer[]> {
  const { data: offers, error } = await supabase
    .from("offers")
    .select("*")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (!offers || offers.length === 0) return [];

  const bikeIds = Array.from(new Set(offers.map((o) => o.bike_id)));
  const { data: bikes, error: bikesError } = await supabase
    .from("bikes")
    .select("*")
    .in("id", bikeIds);
  if (bikesError) throw bikesError;
  const bikesById = new Map((bikes ?? []).map((b) => [b.id, b]));

  return offers.flatMap((offer) => {
    const bike = bikesById.get(offer.bike_id);
    if (!bike) return [];
    return [{ offer, bike }];
  });
}
