import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getConversationThread } from "@/lib/buyer/queries";
import { ChatThread } from "@/components/messages/chat-thread";

export default async function ConversationPage(props: PageProps<"/messages/[id]">) {
  const { id } = await props.params;
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const thread = await getConversationThread(supabase, id, user.id);
  if (!thread) notFound();

  return (
    <div>
      <Link href="/messages" className="text-sm text-muted transition-colors hover:text-brand">
        ← Messages
      </Link>
      <h1 className="mt-2 text-h4 font-semibold tracking-tight">
        {thread.bike.brand} {thread.bike.model}
      </h1>
      <Link
        href={`/bikes/${thread.bike.id}`}
        className="mt-1 inline-block text-sm text-brand hover:underline"
      >
        View listing
      </Link>

      <div className="mt-6">
        <ChatThread conversationId={thread.conversation.id} initialMessages={thread.messages} />
      </div>
    </div>
  );
}
