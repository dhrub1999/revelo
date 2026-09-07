import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { listMyConversations } from "@/lib/buyer/queries";
import { formatShortDate } from "@/lib/format";

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const conversations = await listMyConversations(supabase, user.id);

  return (
    <div>
      <h1 className="text-h4 font-semibold tracking-tight">Messages</h1>
      <p className="mt-1 text-sm text-muted">Chats with sellers about self-listed bikes.</p>

      <div className="mt-6 flex flex-col gap-2">
        {conversations.map(({ conversation, bike, lastMessage }) => (
          <Link
            key={conversation.id}
            href={`/messages/${conversation.id}`}
            className="flex items-center justify-between gap-4 rounded-card border border-line bg-surface p-4 transition-colors hover:border-brand/50"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">
                {bike.brand} {bike.model}
              </p>
              <p className="mt-0.5 truncate text-sm text-muted">
                {lastMessage ? lastMessage.body : "No messages yet — say hello."}
              </p>
            </div>
            {lastMessage && (
              <span className="shrink-0 text-xs text-muted">
                {formatShortDate(lastMessage.created_at)}
              </span>
            )}
          </Link>
        ))}
        {conversations.length === 0 && (
          <div className="rounded-card border border-dashed border-line p-10 text-center text-muted">
            No conversations yet. Message a seller from any self-listed bike&apos;s page.
          </div>
        )}
      </div>
    </div>
  );
}
