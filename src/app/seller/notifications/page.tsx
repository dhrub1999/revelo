import { clsx } from "clsx";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { listMyNotifications } from "@/lib/seller/queries";
import { formatShortDate } from "@/lib/format";
import { MarkNotificationsReadButton } from "@/components/seller/mark-notifications-read-button";

export default async function SellerNotificationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const notifications = await listMyNotifications(supabase, user.id);
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-h4 font-semibold tracking-tight">Notifications</h1>
        <MarkNotificationsReadButton disabled={!hasUnread} />
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={clsx(
              "rounded-control border p-3",
              n.read ? "border-line bg-surface" : "border-brand/30 bg-brand-tint",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <p className={clsx("text-sm", n.read ? "text-ink" : "font-medium text-ink")}>
                {n.body}
              </p>
              <span className="shrink-0 text-xs text-muted">{formatShortDate(n.created_at)}</span>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="rounded-card border border-dashed border-line p-10 text-center text-muted">
            Nothing yet — you&apos;ll see updates on your listings here.
          </div>
        )}
      </div>
    </div>
  );
}
