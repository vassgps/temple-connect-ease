import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bell, BellOff, Bot, Loader2, MoreVertical, RefreshCw } from "lucide-react";
import {
  authApi, listOf, errorText,
  type Notification, type NotificationThread, type NotificationThreadDetail,
} from "@/lib/api";

/* ---------- tolerant readers ---------- */
export function threadId(t: NotificationThread): string {
  return String(t.thread_id ?? t.id ?? t.uuid ?? "");
}
function threadName(t: NotificationThread): string {
  return t.title ?? t.temple_name ?? t.listing_title ?? t.name ?? "TempleAddress";
}
function threadImage(t: NotificationThread): string | null {
  return t.avatar_url ?? t.temple_image ?? t.image ?? t.avatar ?? null;
}
function threadText(t: NotificationThread): string {
  const latest = t.latest_notification;
  if (latest && typeof latest === "object") return latest.message ?? latest.body ?? latest.title ?? "";
  return t.latest_message ?? (latest as string | null) ?? t.last_message ?? t.subtitle ?? "";
}
function threadTime(t: NotificationThread): string {
  const latest = t.latest_notification;
  const fromLatest = latest && typeof latest === "object" ? latest.created_at : undefined;
  return t.latest_at ?? t.latest_time ?? fromLatest ?? t.last_message_at ?? t.updated_at ?? t.created_at ?? "";
}
function threadUnread(t: NotificationThread): number {
  return Number(t.unread_count ?? t.unread ?? 0) || 0;
}
function detailItems(d?: NotificationThreadDetail): Notification[] {
  if (!d) return [];
  return d.notifications ?? d.messages ?? d.results ?? [];
}

export function useUnreadCount() {
  const q = useQuery({ queryKey: ["notification-threads"], queryFn: authApi.notificationThreads, retry: false });
  return listOf<NotificationThread>(q.data).reduce((n, t) => n + threadUnread(t), 0);
}

function timeLabel(v?: string) {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay
    ? d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function Initials({ name, img, size = 52 }: { name: string; img?: string | null; size?: number }) {
  if (img) {
    return (
      <img
        src={img}
        alt={name}
        loading="lazy"
        style={{ width: size, height: size }}
        className="rounded-full object-cover ring-1 ring-border shrink-0"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-earth-soft text-earth font-bold grid place-items-center shrink-0"
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

/* ================= INBOX ================= */
export function NotificationsInbox({
  header,
  openThread,
}: {
  header: React.ReactNode;
  openThread: (id: string, name: string) => void;
}) {
  const q = useQuery({ queryKey: ["notification-threads"], queryFn: authApi.notificationThreads, retry: false });
  const threads = listOf<NotificationThread>(q.data);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {header}
      <div className="flex-1 overflow-y-auto bg-card">
        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <h2 className="font-serif text-base font-bold text-ink">Temple Updates</h2>
          <button onClick={() => q.refetch()} className="size-8 rounded-full bg-muted grid place-items-center">
            <RefreshCw className={`size-4 text-ink-soft ${q.isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>

        {q.isLoading && (
          <div className="py-10 grid place-items-center gap-2 text-ink-soft">
            <Loader2 className="size-5 animate-spin text-earth" />
            <span className="text-xs font-semibold">Loading updates…</span>
          </div>
        )}

        {q.isError && (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-destructive font-semibold">{errorText(q.error)}</p>
            <button onClick={() => q.refetch()} className="mt-3 px-4 py-2 rounded-xl bg-earth text-primary-foreground text-xs font-bold">
              Try again
            </button>
          </div>
        )}

        {!q.isLoading && !q.isError && threads.length === 0 && (
          <div className="px-8 py-12 text-center">
            <div className="size-16 rounded-full bg-muted grid place-items-center mx-auto">
              <BellOff className="size-7 text-ink-soft" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-bold text-ink">No updates yet</h3>
            <p className="mt-1 text-sm text-ink-soft">
              Temple announcements, festival alerts and booking updates will appear here.
            </p>
          </div>
        )}

        {threads.map((t, i) => {
          const id = threadId(t);
          const name = threadName(t);
          const unread = threadUnread(t);
          return (
            <button
              key={id || i}
              onClick={() => openThread(id, name)}
              className={`w-full px-5 py-4 flex gap-4 items-center text-left active:bg-muted/60 ${i !== threads.length - 1 ? "border-b border-border/50" : ""}`}
            >
              <Initials name={name} img={threadImage(t)} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2">
                  <span className={`truncate ${unread ? "font-bold text-ink" : "font-semibold text-ink"}`}>{name}</span>
                  <span className={`text-xs shrink-0 ${unread ? "text-earth font-semibold" : "text-ink-soft"}`}>
                    {timeLabel(threadTime(t))}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className={`text-sm truncate flex-1 ${unread ? "text-ink font-medium" : "text-ink-soft"}`}>
                    {threadText(t)}
                  </p>
                  {unread ? (
                    <span className="min-w-5 h-5 px-1.5 rounded-full bg-earth text-primary-foreground text-[11px] font-bold grid place-items-center shrink-0">
                      {unread}
                    </span>
                  ) : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ================= THREAD DETAIL (read-only) ================= */
export function NotificationThreadView({
  id,
  name,
  back,
}: {
  id: string;
  name: string;
  back: () => void;
}) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["notification-thread", id],
    queryFn: () => authApi.notificationThread(id),
    retry: false,
  });

  const markRead = useMutation({
    mutationFn: () => authApi.markThreadRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notification-threads"] });
      qc.invalidateQueries({ queryKey: ["notification-thread", id] });
    },
  });

  useEffect(() => {
    markRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const detail = q.data;
  const items = detailItems(detail);
  const title = detail ? threadName(detail) : name;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-chat-bg">
      <header className="px-3 py-3 bg-card border-b border-border flex items-center gap-3 shrink-0">
        <button onClick={back} className="size-10 grid place-items-center"><ArrowLeft className="size-5 text-ink" /></button>
        <Initials name={title} img={detail ? threadImage(detail) : null} size={40} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-ink truncate">{title}</div>
          <div className="text-xs text-ink-soft flex items-center gap-1"><Bell className="size-3" /> Notifications only</div>
        </div>
        <button className="size-10 grid place-items-center"><MoreVertical className="size-5 text-ink-soft" /></button>
      </header>

      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        style={{ backgroundImage: "radial-gradient(oklch(0.9 0.02 60) 1px, transparent 1px)", backgroundSize: "18px 18px" }}
      >
        {q.isLoading && (
          <div className="py-10 grid place-items-center"><Loader2 className="size-5 animate-spin text-earth" /></div>
        )}
        {q.isError && <p className="text-sm text-destructive font-semibold text-center py-8">{errorText(q.error)}</p>}
        {!q.isLoading && !q.isError && items.length === 0 && (
          <p className="text-sm text-ink-soft text-center py-10">No notifications in this thread yet.</p>
        )}

        {items.map((n, i) => (
          <div key={n.uuid ?? n.id ?? i} className="flex justify-start">
            <div className="max-w-[88%] px-4 py-3 rounded-2xl rounded-bl-md bg-chat-in shadow-sm">
              {n.title && <p className="text-[13px] font-bold text-earth mb-0.5">{n.title}</p>}
              <p className="text-[15px] leading-snug text-ink whitespace-pre-wrap">{n.message ?? n.body ?? ""}</p>
              <p className="text-[10px] text-ink-soft mt-1.5 text-right">{timeLabel(n.created_at)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-3 bg-card border-t border-border shrink-0 flex items-center justify-center gap-2">
        <Bot className="size-4 text-ink-soft" />
        <p className="text-[11px] text-ink-soft font-semibold text-center">
          Read-only updates from this temple. Replies are not enabled.
        </p>
      </div>
    </div>
  );
}
