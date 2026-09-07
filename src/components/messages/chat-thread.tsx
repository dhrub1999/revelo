"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { clsx } from "clsx";
import { sendMessage, seedSellerReply } from "@/lib/buyer/actions";
import type { MessageRow } from "@/lib/buyer/queries";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const REPLY_DELAY_MS = 1800;

export function ChatThread({
  conversationId,
  initialMessages,
}: {
  conversationId: string;
  initialMessages: MessageRow[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [awaitingReply, setAwaitingReply] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, awaitingReply]);

  function handleSend() {
    const trimmed = body.trim();
    if (!trimmed) return;
    setBody("");
    startTransition(async () => {
      const message = await sendMessage(conversationId, trimmed);
      setMessages((prev) => [...prev, message]);
      setAwaitingReply(true);
      setTimeout(() => {
        startTransition(async () => {
          const reply = await seedSellerReply(conversationId);
          setMessages((prev) => [...prev, reply]);
          setAwaitingReply(false);
        });
      }, REPLY_DELAY_MS);
    });
  }

  return (
    <div className="flex h-[60vh] flex-col rounded-card border border-line bg-surface">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted">Say hello to get the conversation started.</p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={clsx("flex", message.sender_role === "buyer" ? "justify-end" : "justify-start")}
          >
            <div
              className={clsx(
                "max-w-[75%] rounded-card px-3 py-2 text-sm",
                message.sender_role === "buyer"
                  ? "bg-brand-fill text-white"
                  : "bg-paper text-ink",
              )}
            >
              {message.body}
            </div>
          </div>
        ))}
        {awaitingReply && (
          <div className="flex justify-start">
            <div className="max-w-[75%] rounded-card bg-paper px-3 py-2 text-sm text-muted">
              Seller is typing…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 border-t border-line p-3">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Write a message…"
          className="min-h-10 flex-1 resize-none"
        />
        <Button
          disabled={pending || !body.trim()}
          onClick={handleSend}
          className="h-10 self-end rounded-control bg-brand-fill px-4 text-white hover:bg-brand-fill-hover"
        >
          Send
        </Button>
      </div>
    </div>
  );
}
