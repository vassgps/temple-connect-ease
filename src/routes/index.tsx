import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MessageCircle, Compass, CalendarCheck, FilePlus2, User,
  Search, MoreVertical, ArrowLeft, Plus, Mic, Smile,
  MapPin, ShieldCheck, ChevronRight, Check, Loader2,
  Flame, Sparkles, Heart, CalendarDays, CreditCard, Share2, Download,
  Image as ImageIcon, FileText, Camera, Bot, Gift, Wallet,
  Bell, Users, Send, X, Edit3, Inbox,
} from "lucide-react";
import logoMarkAsset from "@/assets/logo-mark.png.asset.json";
import logoFullAsset from "@/assets/logo-full.png.asset.json";
import { ListingHub, MyListings, MeenakshiFlow, type FlowKind } from "@/components/listing-flow";
import { SubmitScreen, type SubmitKind } from "@/components/quick-submit";
import meenakshiImg from "@/assets/meenakshi.jpg";
import { RecaptchaCheckbox } from "@/components/recaptcha-checkbox";
import {
  authApi, bookingApi, discoverApi, listingApi, listOf, countOf, money, placeOf, errorText,
  tokens, recaptchaConfigured, primeRecaptcha,
  type Listing, type Pooja, type Me, type Notification, type Booking,
} from "@/lib/api";

const logoMark = logoMarkAsset.url;
const logoFull = logoFullAsset.url;

export const Route = createFileRoute("/")({
  component: App,
  head: () => ({
    meta: [
      { title: "TempleAddress — Temples, Poojas & Devotee Chat" },
      { name: "description", content: "Find verified temples near you, book poojas with Razorpay, follow festivals and chat with temple communities." },
      { property: "og:title", content: "TempleAddress — Temples, Poojas & Devotee Chat" },
      { property: "og:description", content: "Find verified temples near you, book poojas with Razorpay, follow festivals and chat with temple communities." },
    ],
  }),
});

type Tab = "chats" | "explore" | "bookings" | "submit" | "profile";
type BookDraft = { slug: string; title: string; poojas: Pooja[]; devotee: string; phone: string; nakshatra: string; date: string; donation: string; code?: string };

type View =
  | { name: "tab" }
  | { name: "ai-chat" }
  | { name: "temple"; slug: string }
  | { name: "book-select"; slug: string }
  | { name: "book-details" }
  | { name: "book-payment" }
  | { name: "book-receipt"; code: string }
  | { name: "refer" }
  | { name: "listing-hub" }
  | { name: "my-listings" }
  | { name: "meenakshi"; kind: FlowKind; prefill?: Record<string, string> }
  | { name: "events" };

/* ================= APP SHELL ================= */
function App() {
  const qc = useQueryClient();
  const [hasToken, setHasToken] = useState(false);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    setHasToken(Boolean(tokens.access()));
    setBooted(true);
  }, []);

  const meQ = useQuery({
    queryKey: ["me"],
    queryFn: authApi.me,
    enabled: booted && hasToken,
    retry: false,
  });

  const [tab, setTab] = useState<Tab>("chats");
  const [view, setView] = useState<View>({ name: "tab" });
  const [draft, setDraft] = useState<BookDraft | null>(null);

  const profile = meQ.data;
  const signedIn = Boolean(profile);

  const signOut = () => {
    authApi.logout();
    setHasToken(false);
    qc.clear();
    setView({ name: "tab" });
    setTab("chats");
  };

  return (
    <div className="min-h-screen w-full bg-[oklch(0.88_0.02_60)] flex items-center justify-center md:p-8">
      <div className="relative w-full max-w-[420px] h-[100dvh] md:h-[860px] md:rounded-[44px] bg-cream overflow-hidden md:shadow-frame md:ring-1 md:ring-black/5 flex flex-col">
        <div className="h-6 md:h-8 shrink-0 bg-transparent" />

        {!booted || (hasToken && meQ.isLoading) ? (
          <Splash />
        ) : !signedIn ? (
          <Onboarding
            onDone={() => {
              setHasToken(true);
              qc.invalidateQueries({ queryKey: ["me"] });
            }}
          />
        ) : (
          <>
            <div className="flex-1 min-h-0 flex flex-col">
              {view.name === "tab" && (
                <TabView tab={tab} setTab={setTab} setView={setView} profile={profile!} onSignOut={signOut} />
              )}
              {view.name === "ai-chat" && <AIChat back={() => setView({ name: "tab" })} />}
              {view.name === "temple" && (
                <TempleDetail
                  slug={view.slug}
                  back={() => setView({ name: "tab" })}
                  book={() => setView({ name: "book-select", slug: view.slug })}
                />
              )}
              {view.name === "book-select" && (
                <BookSelect
                  slug={view.slug}
                  profile={profile!}
                  back={() => setView({ name: "temple", slug: view.slug })}
                  next={(d) => { setDraft(d); setView({ name: "book-details" }); }}
                />
              )}
              {view.name === "book-details" && draft && (
                <BookDetails
                  draft={draft}
                  profile={profile!}
                  back={() => setView({ name: "book-select", slug: draft.slug })}
                  next={(d) => { setDraft(d); setView({ name: "book-payment" }); }}
                />
              )}
              {view.name === "book-payment" && draft && (
                <BookPayment
                  draft={draft}
                  back={() => setView({ name: "book-details" })}
                  done={(code) => setView({ name: "book-receipt", code })}
                />
              )}
              {view.name === "book-receipt" && (
                <BookReceipt code={view.code} home={() => { setView({ name: "tab" }); setTab("bookings"); }} />
              )}
              {view.name === "refer" && <ReferEarn profile={profile!} back={() => setView({ name: "tab" })} />}
              {view.name === "listing-hub" && (
                <ListingHub
                  phone={phoneOf(profile)}
                  back={() => setView({ name: "tab" })}
                  start={(k) => setView({ name: "meenakshi", kind: k })}
                  openListings={() => setView({ name: "my-listings" })}
                />
              )}
              {view.name === "my-listings" && <MyListings back={() => setView({ name: "listing-hub" })} />}
              {view.name === "meenakshi" && (
                <MeenakshiFlow
                  kind={view.kind}
                  prefill={view.prefill}
                  phone={phoneOf(profile)}
                  back={() => setView(view.prefill ? { name: "tab" } : { name: "listing-hub" })}
                  onSubmitted={() => setView({ name: "my-listings" })}
                />
              )}
              {view.name === "events" && (
                <EventsFeed back={() => setView({ name: "tab" })} open={(slug) => setView({ name: "temple", slug })} />
              )}
            </div>
            {view.name === "tab" && <BottomNav tab={tab} setTab={setTab} />}
          </>
        )}
      </div>
    </div>
  );
}

function phoneOf(p?: Me) {
  return (p?.mobile_number ?? "").replace(/^\+?91/, "");
}
function nameOf(p?: Me) {
  return p?.name ?? p?.full_name ?? "Devotee";
}

function Splash() {
  return (
    <div className="flex-1 grid place-items-center">
      <div className="text-center">
        <img src={logoMark} alt="TempleAddress" className="size-20 mx-auto" />
        <Loader2 className="size-5 text-earth animate-spin mx-auto mt-4" />
      </div>
    </div>
  );
}

/* ================= SHARED UI ================= */
function Chip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold ${active ? "bg-earth text-primary-foreground" : "bg-muted text-ink-soft"}`}>
      {children}
    </button>
  );
}

function Avatar({ name, img, size = 48 }: { name: string; img?: string | null; size?: number }) {
  const style = { width: size, height: size };
  if (img) return <img src={img} alt={name} style={style} className="rounded-full object-cover ring-1 ring-black/5 shrink-0" loading="lazy" />;
  const label = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return <div style={style} className="rounded-full bg-gradient-to-br from-earth-soft to-earth/30 grid place-items-center font-bold text-earth shrink-0">{label}</div>;
}

function BrandRow({ right }: { right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <img src={logoMark} alt="" className="size-9" />
        <img src={logoFull} alt="TempleAddress" className="h-6 object-contain hidden sm:block" />
        <span className="font-serif text-xl font-bold text-earth sm:hidden">TempleAddress</span>
      </div>
      {right}
    </div>
  );
}

function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="py-10 flex flex-col items-center gap-2 text-ink-soft">
      <Loader2 className="size-6 animate-spin text-earth" />
      <span className="text-xs">{label}</span>
    </div>
  );
}

function EmptyState({ icon: Icon = Inbox, title, sub, action }: { icon?: typeof Inbox; title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="py-10 px-6 flex flex-col items-center text-center gap-2">
      <div className="size-14 rounded-2xl bg-muted grid place-items-center"><Icon className="size-6 text-ink-soft" /></div>
      <div className="font-semibold text-ink">{title}</div>
      {sub && <p className="text-xs text-ink-soft max-w-[260px] leading-snug">{sub}</p>}
      {action}
    </div>
  );
}

function ErrorState({ error, retry }: { error: unknown; retry?: () => void }) {
  return (
    <div className="py-8 px-6 text-center">
      <div className="text-sm font-semibold text-ink">Couldn't load this</div>
      <p className="text-xs text-ink-soft mt-1">{errorText(error)}</p>
      {retry && <button onClick={retry} className="mt-3 h-10 px-4 rounded-full bg-earth text-primary-foreground text-xs font-bold">Try again</button>}
    </div>
  );
}

/* ================= ONBOARDING ================= */
function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);

  const identifier = `91${phone}`;

  // Warm up the reCAPTCHA script as soon as the screen mounts.
  useEffect(() => { primeRecaptcha(); }, []);

  const sendOtp = useMutation({
    mutationFn: async () => {
      setErr(null);
      const token = captcha ?? undefined;
      try {
        await authApi.register({ name, mobile_number: phone, country_code: "+91" }, token);
      } catch {
        /* existing user — continue to login */
      }
      return authApi.login(identifier, token);
    },
    onSuccess: (res) => {
      if (res?.recaptcha_required) {
        setCaptchaReset((n) => n + 1);
        setErr(recaptchaConfigured
          ? "Please tick the “I'm not a robot” box and try again."
          : "reCAPTCHA is required by the server. Add VITE_RECAPTCHA_SITE_KEY to enable OTP login.");
        return;
      }

      setNote(`OTP sent to +91 ${phone}`);
      setStep(2);
    },
    onError: (e) => { setCaptchaReset((n) => n + 1); setErr(errorText(e)); },
  });


  const verify = useMutation({
    mutationFn: () => authApi.verifyOtp(identifier, otp.join("")),
    onSuccess: onDone,
    onError: (e) => setErr(errorText(e)),
  });

  const busy = sendOtp.isPending || verify.isPending;

  return (
    <div className="flex-1 flex flex-col min-h-0 px-6 pb-8">
      <div className="flex-1 flex flex-col items-center justify-center text-center overflow-y-auto">
        <img src={logoMark} alt="TempleAddress" className="size-24 mb-4" />
        <h1 className="font-serif text-3xl text-earth font-bold">TempleAddress</h1>
        <p className="font-ml text-sm text-ink-soft mt-1">ക്ഷേത്ര ദർശനവും പൂജയും ഒരു ആപ്പിൽ</p>
        <p className="text-xs text-ink-soft mt-1">Temples, poojas & devotee community</p>

        {step === 1 ? (
          <div className="w-full mt-8 space-y-4 text-left">
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">Your Name / പേര്</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full h-14 px-4 rounded-2xl bg-card ring-1 ring-border font-semibold text-ink outline-none focus:ring-2 focus:ring-earth" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">Mobile / മൊബൈൽ</label>
              <div className="flex gap-2">
                <div className="h-14 px-4 rounded-2xl bg-card ring-1 ring-border font-semibold text-ink grid place-items-center">+91</div>
                <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" placeholder="10-digit number" className="flex-1 h-14 px-4 rounded-2xl bg-card ring-1 ring-border font-semibold text-ink outline-none focus:ring-2 focus:ring-earth" />
              </div>
              <p className="text-xs text-ink-soft mt-1.5">Asked only once. We'll never ask again on bookings.</p>
            </div>
            {recaptchaConfigured && (
              <div className="pt-1">
                <RecaptchaCheckbox onChange={setCaptcha} resetKey={captchaReset} />
              </div>
            )}
          </div>

        ) : (
          <div className="w-full mt-8 text-left">
            <label className="block text-sm font-semibold text-ink mb-2">Enter OTP sent to +91 {phone}</label>
            <div className="flex gap-2 justify-center mt-2">
              {otp.map((v, i) => (
                <input
                  key={i}
                  autoFocus={i === 0}
                  value={v}
                  maxLength={1}
                  inputMode="numeric"
                  onChange={(e) => {
                    const d = e.target.value.replace(/\D/g, "").slice(-1);
                    setOtp((o) => o.map((x, j) => (j === i ? d : x)));
                    if (d) (e.target.parentElement?.children[i + 1] as HTMLInputElement | undefined)?.focus();
                  }}
                  className="size-12 text-center rounded-2xl bg-card ring-1 ring-border font-bold text-xl text-ink outline-none focus:ring-2 focus:ring-earth"
                />
              ))}
            </div>
            <button onClick={() => sendOtp.mutate()} disabled={busy} className="text-xs text-earth font-semibold mt-3 block mx-auto">Resend OTP</button>
          </div>
        )}

        {note && !err && <p className="text-xs text-verified font-semibold mt-4">{note}</p>}
        {err && <p className="text-xs text-destructive font-semibold mt-4 max-w-[300px]">{err}</p>}
      </div>

      <button
        onClick={() => (step === 1 ? sendOtp.mutate() : verify.mutate())}
        disabled={busy || (step === 1 ? !name || phone.length < 10 : otp.join("").length < 4)}
        className="w-full h-14 rounded-2xl bg-earth text-primary-foreground font-bold shadow-soft flex items-center justify-center gap-2 disabled:opacity-40"
      >
        {busy ? <Loader2 className="size-5 animate-spin" /> : null}
        {step === 1 ? "Send OTP" : "Verify & Continue"} <ChevronRight className="size-5" />
      </button>
      <p className="text-[11px] text-ink-soft text-center mt-3">By continuing you agree to TempleAddress Terms.</p>
    </div>
  );
}

/* ================= NAV ================= */
function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const notifQ = useQuery({ queryKey: ["notifications"], queryFn: authApi.notifications, retry: false });
  const unread = listOf<Notification>(notifQ.data).filter((n) => n.is_read === false).length;

  const items: { id: Tab; label: string; icon: typeof MessageCircle; badge?: number }[] = [
    { id: "chats", label: "Chats", icon: MessageCircle, badge: unread || undefined },
    { id: "explore", label: "Explore", icon: Compass },
    { id: "bookings", label: "Bookings", icon: CalendarCheck },
    { id: "submit", label: "Submit", icon: FilePlus2 },
    { id: "profile", label: "Profile", icon: User },
  ];
  return (
    <nav className="shrink-0 bg-card border-t border-border pb-safe">
      <div className="flex justify-around items-center h-20 px-2">
        {items.map((it) => {
          const active = tab === it.id;
          const Icon = it.icon;
          return (
            <button key={it.id} onClick={() => setTab(it.id)} className="flex flex-col items-center justify-center gap-1 flex-1 h-full active:scale-95 transition">
              <div className="relative">
                <Icon className={`size-6 ${active ? "text-earth" : "text-ink-soft"}`} strokeWidth={active ? 2.4 : 2} />
                {it.badge ? <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-earth text-primary-foreground text-[10px] font-bold grid place-items-center">{it.badge}</span> : null}
              </div>
              <span className={`text-[10px] font-semibold tracking-wide ${active ? "text-earth" : "text-ink-soft"}`}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function TabView({ tab, setView, setTab, profile, onSignOut }: {
  tab: Tab; setView: (v: View) => void; setTab: (t: Tab) => void; profile: Me; onSignOut: () => void;
}) {
  if (tab === "chats") return <ChatsList openAI={() => setView({ name: "ai-chat" })} />;
  if (tab === "explore") return <ExploreTemples open={(slug) => setView({ name: "temple", slug })} openEvents={() => setView({ name: "events" })} />;
  if (tab === "bookings") return <BookingsList goExplore={() => setTab("explore")} openReceipt={(code) => setView({ name: "book-receipt", code })} />;
  if (tab === "submit") return (
    <SubmitScreen
      logoMark={logoMark}
      openFullFlow={(k: SubmitKind, prefill?: Record<string, string>) =>
        setView({ name: "meenakshi", kind: k === "festival" ? "event" : k, prefill })}
    />
  );
  return (
    <ProfileScreen
      profile={profile}
      openRefer={() => setView({ name: "refer" })}
      openHub={() => setView({ name: "listing-hub" })}
      openListings={() => setView({ name: "my-listings" })}
      onSignOut={onSignOut}
      goSubmit={() => setTab("submit")}
    />
  );
}

/* ================= NOTIFICATIONS INBOX ================= */
function InboxScreen({ openAI, openThread }: { openAI: () => void; openThread: (id: string, name: string) => void }) {
  return (
    <NotificationsInbox
      openThread={openThread}
      header={
        <>
          <header className="px-5 pt-3 pb-4 bg-card">
            <BrandRow right={
              <button className="size-10 rounded-full bg-muted grid place-items-center"><Bell className="size-5 text-ink-soft" /></button>
            } />
            <h1 className="mt-3 text-2xl font-bold text-ink">Notifications</h1>
          </header>

          <button onClick={openAI} className="shrink-0 w-full px-5 py-4 flex gap-4 items-center bg-gradient-to-r from-earth-soft/70 to-gold/20 border-y border-border/50 active:opacity-80">
            <div className="relative shrink-0">
              <img src={meenakshiImg} alt="Meenakshi" width={816} height={816} loading="lazy" className="size-14 rounded-full object-cover object-top ring-2 ring-cream" />
              <span className="absolute -bottom-0.5 -right-0.5 size-5 rounded-full bg-verified ring-2 ring-cream grid place-items-center">
                <Bot className="size-3 text-white" />
              </span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex justify-between items-baseline gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold text-ink truncate">Ask TempleAddress</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-earth text-primary-foreground uppercase">AI</span>
                </div>
                <span className="text-xs text-ink-soft shrink-0">Always on</span>
              </div>
              <p className="text-sm text-ink-soft truncate mt-0.5">Meenakshi answers about temples, poojas, festivals or your bookings…</p>
            </div>
            <ChevronRight className="size-5 text-earth shrink-0" />
          </button>
        </>
      }
    />
  );
}


/* ================= AI CHAT (Meenakshi) ================= */
type AIMsg = { id: number; from: "me" | "ai"; text?: string; kind?: "text" | "image" | "file" | "voice"; meta?: string };
const AI_URL = import.meta.env.VITE_AI_CHAT_URL as string | undefined;

function AIChat({ back }: { back: () => void }) {
  const [msgs, setMsgs] = useState<AIMsg[]>([
    { id: 1, from: "ai", text: "🙏 Namaskaram! I'm Meenakshi, your TempleAddress assistant. Ask me about any temple, pooja, festival — or your own bookings. English or Malayalam." },
  ]);
  const [input, setInput] = useState("");
  const [showAttach, setShowAttach] = useState(false);
  const [busy, setBusy] = useState(false);

  const suggestions = ["Nearby temples", "Next festival", "My bookings", "Pooja timings"];

  const send = async (text?: string, kind: "text" | "image" | "file" | "voice" = "text", meta?: string) => {
    const t = (text ?? input).trim();
    if (!t && kind === "text") return;
    setMsgs((m) => [...m, { id: Date.now(), from: "me", text: t, kind, meta }]);
    setInput("");
    setShowAttach(false);

    if (!AI_URL) {
      setMsgs((m) => [...m, {
        id: Date.now() + 1, from: "ai",
        text: "I'm not connected to the knowledge base yet. Once the RAG endpoint is configured I'll answer from live temple, festival and booking data.",
      }]);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: t, kind }),
      });
      const data = (await res.json()) as { reply?: string; message?: string; output?: string };
      setMsgs((m) => [...m, { id: Date.now() + 2, from: "ai", text: data.reply ?? data.output ?? data.message ?? "…" }]);
    } catch (e) {
      setMsgs((m) => [...m, { id: Date.now() + 3, from: "ai", text: errorText(e) }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-chat-bg">
      <header className="px-3 py-3 bg-card border-b border-border flex items-center gap-3 shrink-0">
        <button onClick={back} className="size-10 grid place-items-center"><ArrowLeft className="size-5 text-ink" /></button>
        <img src={meenakshiImg} alt="Meenakshi" width={816} height={816} loading="lazy" className="size-10 rounded-full object-cover object-top ring-2 ring-cream" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-ink flex items-center gap-1.5">
            Meenakshi <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-earth text-primary-foreground">AI</span>
          </div>
          <div className="text-xs text-verified flex items-center gap-1"><Bot className="size-3" /> temples, festivals & bookings</div>
        </div>
        <button className="size-10 grid place-items-center"><MoreVertical className="size-5 text-ink-soft" /></button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2" style={{ backgroundImage: "radial-gradient(oklch(0.9 0.02 60) 1px, transparent 1px)", backgroundSize: "18px 18px" }}>
        {msgs.map((m) => (
          <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[82%] px-3.5 py-2 rounded-2xl shadow-sm ${m.from === "me" ? "bg-chat-out text-ink rounded-br-md" : "bg-chat-in text-ink rounded-bl-md"}`}>
              {m.kind === "image" && <div className="mb-1 rounded-lg bg-earth-soft/60 p-8 grid place-items-center"><ImageIcon className="size-8 text-earth" /></div>}
              {m.kind === "file" && <div className="mb-1 flex items-center gap-2 p-2 bg-cream/60 rounded-lg"><FileText className="size-5 text-earth" /><span className="text-xs font-semibold">{m.meta ?? "document.pdf"}</span></div>}
              {m.kind === "voice" && <div className="mb-1 flex items-center gap-2 p-2 bg-cream/60 rounded-lg"><Mic className="size-4 text-earth" /><span className="text-xs">Voice note</span></div>}
              {m.text && <p className="text-[15px] leading-snug whitespace-pre-wrap">{m.text}</p>}
            </div>
          </div>
        ))}
        {busy && <div className="flex justify-start"><div className="px-3.5 py-2 rounded-2xl bg-chat-in"><Loader2 className="size-4 animate-spin text-earth" /></div></div>}
        <div className="pt-2 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button key={s} onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full bg-cream ring-1 ring-earth/30 text-earth font-semibold">{s}</button>
          ))}
        </div>
      </div>

      {showAttach && (
        <div className="mx-2 mb-2 p-3 rounded-2xl bg-card shadow-soft grid grid-cols-4 gap-2">
          {[
            { i: Camera, l: "Camera", a: () => send("Photo", "image") },
            { i: ImageIcon, l: "Photo", a: () => send("Photo", "image") },
            { i: FileText, l: "File", a: () => send("File", "file") },
            { i: Mic, l: "Voice", a: () => send("Voice note", "voice") },
          ].map((x) => (
            <button key={x.l} onClick={x.a} className="flex flex-col items-center gap-1 p-2 rounded-xl active:bg-muted">
              <div className="size-11 rounded-full bg-earth-soft grid place-items-center"><x.i className="size-5 text-earth" /></div>
              <span className="text-[11px] text-ink-soft font-semibold">{x.l}</span>
            </button>
          ))}
        </div>
      )}

      <div className="p-2 bg-transparent shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-card rounded-full px-4 py-2.5 shadow-sm">
            <button onClick={() => setShowAttach((s) => !s)} className="shrink-0">
              {showAttach ? <X className="size-5 text-earth" /> : <Plus className="size-5 text-ink-soft" />}
            </button>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask anything about temples…" className="flex-1 bg-transparent outline-none text-[15px]" />
            <Smile className="size-5 text-ink-soft" />
          </div>
          <button onClick={() => (input.trim() ? send() : send("Voice note", "voice"))} className="size-12 rounded-full bg-earth grid place-items-center shadow-soft">
            {input.trim() ? <Send className="size-5 text-primary-foreground" /> : <Mic className="size-5 text-primary-foreground" />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= EXPLORE ================= */
type Filter = "near" | "verified" | "pooja" | "festivals" | "services";

function ExploreTemples({ open, openEvents }: { open: (slug: string) => void; openEvents: () => void }) {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("near");

  useEffect(() => {
    const t = setTimeout(() => setSearch(q.trim()), 400);
    return () => clearTimeout(t);
  }, [q]);

  const params = useMemo(() => {
    if (filter === "verified") return { listing_type: "temples" as const, select: "verified_temple" as const };
    if (filter === "pooja") return { listing_type: "temples" as const, select: "pooja_booking" as const };
    if (filter === "festivals") return { listing_type: "festivals" as const };
    if (filter === "services") return { listing_type: "services" as const };
    return { listing_type: "temples" as const };
  }, [filter]);

  const listQ = useQuery({
    queryKey: ["discover", params, search],
    queryFn: () => discoverApi.list({ ...params, search: search || undefined }),
  });
  const festivalsQ = useQuery({
    queryKey: ["discover", "festivals", "reel"],
    queryFn: () => discoverApi.list({ listing_type: "festivals", limit: 10 }),
  });
  const servicesQ = useQuery({
    queryKey: ["discover", "services", "reel"],
    queryFn: () => discoverApi.list({ listing_type: "services", limit: 10 }),
  });
  const prefQ = useQuery({ queryKey: ["listing-preferences"], queryFn: listingApi.preferences, retry: false });

  const items = listOf<Listing>(listQ.data);
  const festivals = listOf<Listing>(festivalsQ.data);
  const services = listOf<Listing>(servicesQ.data);
  const subscribed = listOf<Listing>(prefQ.data);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <header className="px-5 pt-3 pb-4 bg-card">
        <BrandRow />
        <div className="mt-4 relative">
          <Search className="size-5 text-ink-soft absolute left-4 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search temples, poojas, festivals…" className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-muted text-[15px] outline-none placeholder:text-ink-soft" />
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
          <Chip active={filter === "near"} onClick={() => setFilter("near")}>All Temples</Chip>
          <Chip active={filter === "verified"} onClick={() => setFilter("verified")}>Verified</Chip>
          <Chip active={filter === "pooja"} onClick={() => setFilter("pooja")}>Pooja Booking</Chip>
          <Chip active={filter === "festivals"} onClick={() => setFilter("festivals")}>Festivals</Chip>
          <Chip active={filter === "services"} onClick={() => setFilter("services")}>Services</Chip>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-6">
        {/* Upcoming events */}
        <div className="px-5 pt-5">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-serif text-lg text-ink">Upcoming Events & Festivals</h2>
            <button onClick={openEvents} className="text-xs text-earth font-semibold">See all</button>
          </div>
          {festivalsQ.isLoading ? <Loading /> : festivals.length === 0 ? (
            <div className="rounded-2xl bg-card ring-1 ring-border"><EmptyState icon={CalendarDays} title="No festivals listed yet" sub="Festival and event listings will show up here as temples publish them." /></div>
          ) : (
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5">
              {festivals.map((e) => (
                <button key={e.uuid} onClick={() => open(e.slug)} className="w-56 shrink-0 rounded-2xl overflow-hidden bg-card ring-1 ring-border text-left active:scale-[0.98] transition">
                  <div className="relative h-24 bg-muted">
                    {e.image ? <img src={e.image} alt={e.title} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full grid place-items-center"><CalendarDays className="size-6 text-ink-soft" /></div>}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-earth text-primary-foreground text-[9px] font-bold uppercase">{e.category_name ?? "Festival"}</span>
                  </div>
                  <div className="p-3">
                    <div className="font-semibold text-ink text-sm leading-tight line-clamp-2">{e.title}</div>
                    {e.start_date && <div className="text-xs text-earth font-semibold mt-1.5">{e.start_date}</div>}
                    <div className="text-[11px] text-ink-soft truncate">{placeOf(e)}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Subscribed temples */}
        {subscribed.length > 0 && (
          <div className="px-5 pt-6">
            <h2 className="font-serif text-lg text-ink mb-3">From Your Subscribed Temples</h2>
            <div className="space-y-2">
              {subscribed.map((t) => (
                <button key={t.uuid} onClick={() => open(t.slug)} className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card ring-1 ring-border active:bg-muted text-left">
                  {t.image ? <img src={t.image} alt={t.title} className="size-12 rounded-xl object-cover" loading="lazy" /> : <div className="size-12 rounded-xl bg-earth-soft grid place-items-center"><Flame className="size-5 text-earth" /></div>}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink text-sm truncate">{t.title}</div>
                    <div className="text-xs text-ink-soft truncate">{placeOf(t)}</div>
                  </div>
                  <div className="size-8 rounded-full bg-earth-soft grid place-items-center"><Bell className="size-4 text-earth" /></div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main list */}
        <div className="px-5 pt-6">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-serif text-lg text-ink">{search ? `Results for “${search}”` : filter === "services" ? "Services" : filter === "festivals" ? "Festivals" : "Temples"}</h2>
            {!listQ.isLoading && <span className="text-xs text-ink-soft">{countOf(listQ.data)} results</span>}
          </div>

          {listQ.isLoading && <Loading label="Loading listings…" />}
          {listQ.isError && <ErrorState error={listQ.error} retry={() => listQ.refetch()} />}
          {!listQ.isLoading && !listQ.isError && items.length === 0 && (
            <EmptyState icon={Compass} title="Nothing found" sub={search ? "Try a different name, place or deity." : "No listings published in this category yet."} />
          )}

          <div className="space-y-4">
            {items.map((t) => (
              <button key={t.uuid} onClick={() => open(t.slug)} className="w-full bg-card rounded-3xl overflow-hidden shadow-soft ring-1 ring-black/5 active:scale-[0.99] transition text-left">
                <div className="relative">
                  {t.image ? (
                    <img src={t.image} alt={t.title} loading="lazy" className="w-full aspect-[16/10] object-cover" />
                  ) : (
                    <div className="w-full aspect-[16/10] bg-earth-soft grid place-items-center"><Flame className="size-10 text-earth/60" /></div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {t.ownership_verified && <span className="px-2 py-1 rounded-md bg-cream/95 text-verified text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><ShieldCheck className="size-3" /> Verified</span>}
                    {t.allow_booking && <span className="px-2 py-1 rounded-md bg-earth text-primary-foreground text-[10px] font-bold uppercase tracking-wider">Pooja Open</span>}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-lg text-ink leading-tight">{t.title}</h3>
                  {t.subtitle && t.subtitle !== t.title && <div className="text-sm text-ink-soft mt-0.5 line-clamp-1">{t.subtitle}</div>}
                  <div className="mt-3 flex items-center gap-2 text-sm text-ink-soft">
                    <span className="flex items-center gap-1 min-w-0"><MapPin className="size-4 shrink-0" /><span className="truncate">{placeOf(t) || "—"}</span></span>
                    {typeof t.pooja_count === "number" && t.pooja_count > 0 && (<><span>·</span><span className="text-earth font-semibold shrink-0">{t.pooja_count} poojas</span></>)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Service professionals */}
        <div className="px-5 pt-6">
          <h2 className="font-serif text-lg text-ink mb-3">Service Professionals</h2>
          {servicesQ.isLoading ? <Loading /> : services.length === 0 ? (
            <div className="rounded-2xl bg-card ring-1 ring-border"><EmptyState icon={Users} title="No services listed yet" sub="Priests, flower suppliers and other professionals will appear here." /></div>
          ) : (
            <div className="space-y-2">
              {services.map((p) => (
                <button key={p.uuid} onClick={() => open(p.slug)} className="w-full p-3 rounded-2xl bg-card ring-1 ring-border flex items-center gap-3 text-left">
                  {p.image ? <img src={p.image} alt={p.title} className="size-11 rounded-xl object-cover" loading="lazy" /> : <div className="size-11 rounded-xl bg-gradient-to-br from-gold/30 to-earth/20 grid place-items-center font-bold text-earth">{p.title.slice(0, 2).toUpperCase()}</div>}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink text-sm truncate">{p.title}</div>
                    <div className="text-xs text-ink-soft truncate">{[p.category_name, placeOf(p)].filter(Boolean).join(" · ")}</div>
                  </div>
                  <ChevronRight className="size-5 text-ink-soft shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= EVENTS FEED ================= */
function EventsFeed({ back, open }: { back: () => void; open: (slug: string) => void }) {
  const q = useQuery({ queryKey: ["discover", "festivals", "all"], queryFn: () => discoverApi.list({ listing_type: "festivals", limit: 20 }) });
  const items = listOf<Listing>(q.data);
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <header className="px-5 pt-3 pb-4 bg-card flex items-center gap-3">
        <button onClick={back} className="size-10 rounded-full bg-muted grid place-items-center"><ArrowLeft className="size-5 text-ink" /></button>
        <div>
          <div className="text-lg font-bold text-ink">Events & Festivals</div>
          <div className="text-xs text-ink-soft">Live from TempleAddress listings</div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {q.isLoading && <Loading />}
        {q.isError && <ErrorState error={q.error} retry={() => q.refetch()} />}
        {!q.isLoading && items.length === 0 && <EmptyState icon={CalendarDays} title="No events yet" sub="Once temples publish festivals, they'll be listed here." />}
        {items.map((e) => (
          <button key={e.uuid} onClick={() => open(e.slug)} className="w-full flex gap-3 p-3 rounded-2xl bg-card ring-1 ring-border text-left">
            {e.image ? <img src={e.image} alt={e.title} className="size-20 rounded-2xl object-cover shrink-0" loading="lazy" /> : <div className="size-20 rounded-2xl bg-earth-soft grid place-items-center shrink-0"><CalendarDays className="size-7 text-earth" /></div>}
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-earth text-primary-foreground uppercase">{e.category_name ?? "Event"}</span>
              <div className="font-semibold text-ink mt-1">{e.title}</div>
              {e.start_date && <div className="text-xs text-earth font-semibold mt-1">{e.start_date}{e.end_date ? ` → ${e.end_date}` : ""}</div>}
              <div className="text-[11px] text-ink-soft truncate">{placeOf(e)}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ================= TEMPLE DETAIL ================= */
function TempleDetail({ slug, back, book }: { slug: string; back: () => void; book: () => void }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["listing", slug], queryFn: () => discoverApi.detail(slug) });
  const contactsQ = useQuery({ queryKey: ["listing", slug, "contacts"], queryFn: () => discoverApi.contacts(slug) });
  const nearbyQ = useQuery({ queryKey: ["listing", slug, "nearby"], queryFn: () => discoverApi.nearby(slug) });

  const subscribe = useMutation({
    mutationFn: () => listingApi.setPreference(q.data!.uuid, "subscribe"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listing-preferences"] }),
  });
  const save = useMutation({
    mutationFn: () => listingApi.setPreference(q.data!.uuid, "save"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listing-preferences"] }),
  });

  if (q.isLoading) return <div className="flex-1 grid place-items-center"><Loading label="Loading temple…" /></div>;
  if (q.isError || !q.data) return (
    <div className="flex-1 flex flex-col">
      <header className="px-5 pt-3 pb-4 bg-card flex items-center gap-3"><button onClick={back} className="size-10 rounded-full bg-muted grid place-items-center"><ArrowLeft className="size-5 text-ink" /></button><div className="font-bold text-ink">Temple</div></header>
      <ErrorState error={q.error} retry={() => q.refetch()} />
    </div>
  );

  const t = q.data;
  const info = t.info ?? {};
  const poojas = (info.pooja_list ?? []).filter((p) => p.is_active !== false);
  const contacts = contactsQ.data;
  const nearby = listOf<Listing>(nearbyQ.data);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="relative shrink-0">
        {t.image ? <img src={t.image} alt={t.title} className="w-full h-64 object-cover" /> : <div className="w-full h-64 bg-earth-soft grid place-items-center"><Flame className="size-12 text-earth/60" /></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
        <button onClick={back} className="absolute top-3 left-3 size-10 rounded-full bg-cream/95 grid place-items-center"><ArrowLeft className="size-5 text-ink" /></button>
        <div className="absolute top-3 right-3 flex gap-2">
          <button onClick={() => save.mutate()} className="size-10 rounded-full bg-cream/95 grid place-items-center" aria-label="Save temple"><Heart className={`size-4 ${save.isSuccess ? "text-earth fill-earth" : "text-ink"}`} /></button>
          <button onClick={() => subscribe.mutate()} className="size-10 rounded-full bg-cream/95 grid place-items-center" aria-label="Subscribe"><Bell className={`size-4 ${subscribe.isSuccess ? "text-verified" : "text-earth"}`} /></button>
        </div>
        <div className="absolute bottom-4 left-5 right-5 text-white">
          <div className="flex gap-1.5 mb-2">
            {t.ownership_verified && <span className="px-2 py-0.5 rounded bg-verified text-white text-[10px] font-bold uppercase">Verified</span>}
            {t.category_name && <span className="px-2 py-0.5 rounded bg-earth text-white text-[10px] font-bold uppercase">{t.category_name}</span>}
          </div>
          <h1 className="font-serif text-2xl leading-tight">{t.title}</h1>
          <p className="text-sm text-white/90 mt-0.5">{placeOf(t)}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-card">
        <div className="p-5 space-y-5">
          {(subscribe.isError || save.isError) && (
            <p className="text-xs text-destructive">{errorText(subscribe.error ?? save.error)}</p>
          )}

          {t.description && <p className="text-[15px] leading-relaxed text-ink">{t.description}</p>}

          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Opening" value={fmtTime(info.morning_opening_time) || "—"} sub="Morning darshan" />
            <InfoCard label="Closing" value={fmtTime(info.evening_closing_time ?? info.morning_closing_time) || "—"} sub="Evening" />
            <InfoCard label="Code" value={t.code ?? "—"} sub="TempleAddress ID" />
            <InfoCard label="Deity" value={info.main_deity?.name ?? "—"} sub="Primary" />
          </div>

          {contacts && (
            <div className="p-4 rounded-2xl bg-muted">
              <div className="text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-2">Contact</div>
              <div className="text-sm text-ink space-y-1">
                {contacts.designation && <div>{String(contacts.designation)}</div>}
                <div>{String(contacts.contact_number || contacts.contact_number_masked || "—")}</div>
                {(contacts.whatsapp_number || contacts.whatsapp_number_masked) && (
                  <div className="text-ink-soft">WhatsApp · {String(contacts.whatsapp_number || contacts.whatsapp_number_masked)}</div>
                )}
              </div>
            </div>
          )}

          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-2">Poojas</div>
            {poojas.length === 0 ? (
              <EmptyState icon={Flame} title="No poojas published" sub="This temple has not listed poojas for online booking yet." />
            ) : (
              <div className="space-y-2">
                {poojas.slice(0, 4).map((p) => (
                  <div key={p.uuid} className="flex items-center justify-between p-3 rounded-2xl bg-muted">
                    <div className="min-w-0 pr-3">
                      <div className="font-semibold text-ink text-sm truncate">{p.name}</div>
                      {p.pooja_category_detail?.name && <div className="text-xs text-ink-soft">{p.pooja_category_detail.name}</div>}
                    </div>
                    <div className="font-serif font-semibold text-earth shrink-0">{money(p.rate)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {nearby.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-2">Nearby temples</div>
              <div className="space-y-2">
                {nearby.map((n) => (
                  <div key={n.uuid} className="p-3 rounded-2xl bg-muted flex items-center gap-3">
                    <MapPin className="size-4 text-earth shrink-0" />
                    <div className="flex-1 min-w-0"><div className="text-sm font-semibold text-ink truncate">{n.title}</div><div className="text-xs text-ink-soft truncate">{placeOf(n)}</div></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 p-4 bg-card border-t border-border flex gap-3">
        <button className="size-14 rounded-2xl bg-earth-soft grid place-items-center"><MessageCircle className="size-6 text-earth" /></button>
        <button
          onClick={book}
          disabled={poojas.length === 0}
          className="flex-1 h-14 rounded-2xl bg-earth text-primary-foreground font-bold text-base shadow-soft flex items-center justify-center gap-2 disabled:opacity-40"
        >
          <Flame className="size-5" /> {poojas.length === 0 ? "Booking unavailable" : "Book Pooja"}
        </button>
      </div>
    </div>
  );
}

function fmtTime(v?: unknown) {
  if (typeof v !== "string" || !v) return "";
  const [h, m] = v.split(":");
  const hour = Number(h);
  if (!Number.isFinite(hour)) return v;
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${m ?? "00"} ${ampm}`;
}

function InfoCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="p-3 rounded-2xl bg-muted">
      <div className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">{label}</div>
      <div className="font-serif text-lg text-ink mt-0.5 truncate">{value}</div>
      <div className="text-xs text-ink-soft">{sub}</div>
    </div>
  );
}

/* ================= BOOKING ================= */
function Stepper({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <div className="flex items-center gap-1 px-5 py-4 bg-card">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="flex items-center flex-1 last:flex-none">
          <div className={`size-8 rounded-full grid place-items-center text-xs font-bold shrink-0 ${n < step ? "bg-earth text-primary-foreground" : n === step ? "bg-earth text-primary-foreground ring-4 ring-earth/20" : "bg-muted text-ink-soft"}`}>
            {n < step ? <Check className="size-4" /> : n}
          </div>
          {n < 4 && <div className={`h-0.5 flex-1 mx-1 ${n < step ? "bg-earth" : "bg-muted"}`} />}
        </div>
      ))}
    </div>
  );
}

function BookHeader({ back, title, sub }: { back: () => void; title: string; sub?: string }) {
  return (
    <header className="px-5 pt-3 pb-4 bg-card flex items-center gap-3 shrink-0">
      <button onClick={back} className="size-10 rounded-full bg-muted grid place-items-center"><ArrowLeft className="size-5 text-ink" /></button>
      <div className="min-w-0">
        <div className="text-lg font-bold text-ink truncate">{title}</div>
        {sub && <div className="text-xs text-ink-soft truncate">{sub}</div>}
      </div>
    </header>
  );
}

function BookSelect({ slug, profile, back, next }: { slug: string; profile: Me; back: () => void; next: (d: BookDraft) => void }) {
  const q = useQuery({ queryKey: ["listing", slug], queryFn: () => discoverApi.detail(slug) });
  const [selected, setSelected] = useState<string[]>([]);

  const poojas = (q.data?.info?.pooja_list ?? []).filter((p) => p.is_active !== false);
  const chosen = poojas.filter((p) => selected.includes(p.uuid));
  const total = chosen.reduce((a, b) => a + Number(b.rate || 0), 0);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <BookHeader back={back} title={q.data?.title ?? "Book Pooja"} sub="Select Poojas · Step 1 of 4" />
      <Stepper step={1} />
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {q.isLoading && <Loading label="Loading poojas…" />}
        {q.isError && <ErrorState error={q.error} retry={() => q.refetch()} />}
        {!q.isLoading && poojas.length === 0 && <EmptyState icon={Flame} title="No poojas available" sub="This temple hasn't published bookable poojas." />}
        {poojas.map((p) => {
          const on = selected.includes(p.uuid);
          return (
            <button key={p.uuid} onClick={() => setSelected((s) => (on ? s.filter((x) => x !== p.uuid) : [...s, p.uuid]))} className={`w-full text-left p-4 rounded-2xl bg-card ring-2 transition ${on ? "ring-earth" : "ring-border"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-ink">{p.name}</span>
                    {p.pooja_category_detail?.name && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-earth-soft text-earth uppercase">{p.pooja_category_detail.name}</span>}
                  </div>
                  {p.description && p.description !== p.name && <div className="text-xs text-ink-soft mt-1.5">{p.description}</div>}
                  {p.start_time && <div className="text-xs text-ink-soft mt-1">{fmtTime(p.start_time)} – {fmtTime(p.end_time)}</div>}
                </div>
                <div className="text-right shrink-0">
                  <div className="font-serif font-bold text-lg text-earth">{money(p.rate)}</div>
                  <div className={`mt-1 size-6 rounded-full grid place-items-center ml-auto ${on ? "bg-earth text-primary-foreground" : "bg-muted text-ink-soft"}`}>{on ? <Check className="size-4" /> : <Plus className="size-4" />}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="shrink-0 p-4 bg-card border-t border-border flex items-center gap-3">
        <div className="flex-1"><div className="text-xs text-ink-soft">{chosen.length} pooja{chosen.length !== 1 ? "s" : ""} selected</div><div className="text-xl font-bold text-ink">{money(total)}</div></div>
        <button
          onClick={() => next({
            slug, title: q.data?.title ?? "", poojas: chosen,
            devotee: nameOf(profile), phone: phoneOf(profile), nakshatra: "",
            date: new Date().toISOString().slice(0, 10), donation: "",
          })}
          disabled={chosen.length === 0}
          className="h-14 px-8 rounded-2xl bg-earth text-primary-foreground font-bold shadow-soft disabled:opacity-50 flex items-center gap-2"
        >
          Continue <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}

function BookDetails({ draft, profile, back, next }: { draft: BookDraft; profile: Me; back: () => void; next: (d: BookDraft) => void }) {
  const [d, setD] = useState<BookDraft>(draft);
  const [changePhone, setChangePhone] = useState(d.phone !== phoneOf(profile));
  const subtotal = d.poojas.reduce((a, b) => a + Number(b.rate || 0), 0);
  const total = subtotal + Number(d.donation || 0);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <BookHeader back={back} title={d.title} sub="Devotee Details · Step 2 of 4" />
      <Stepper step={2} />
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <div className="p-3 rounded-2xl bg-verified/10 border border-verified/20 flex items-start gap-2">
          <ShieldCheck className="size-4 text-verified mt-0.5" />
          <div className="text-xs text-ink"><span className="font-semibold text-verified">{nameOf(profile)}</span> · +91 {phoneOf(profile)} — verified profile. No OTP needed for this booking.</div>
        </div>

        <Field label="Devotee Name / പേര്" required>
          <input value={d.devotee} onChange={(e) => setD({ ...d, devotee: e.target.value })} className="w-full h-14 px-4 rounded-2xl bg-card ring-1 ring-border font-semibold text-ink outline-none focus:ring-2 focus:ring-earth" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nakshatra / നക്ഷത്രം">
            <input value={d.nakshatra} onChange={(e) => setD({ ...d, nakshatra: e.target.value })} placeholder="Optional" className="w-full h-14 px-4 rounded-2xl bg-card ring-1 ring-border font-semibold text-ink outline-none focus:ring-2 focus:ring-earth" />
          </Field>
          <Field label="Pooja Date" required>
            <input type="date" value={d.date} onChange={(e) => setD({ ...d, date: e.target.value })} className="w-full h-14 px-4 rounded-2xl bg-card ring-1 ring-border font-semibold text-ink outline-none" />
          </Field>
        </div>

        <div className="p-3 rounded-2xl bg-muted">
          <button onClick={() => { const on = !changePhone; setChangePhone(on); if (!on) setD({ ...d, phone: phoneOf(profile) }); }} className="w-full flex items-center justify-between">
            <div className="text-left">
              <div className="text-sm font-semibold text-ink flex items-center gap-1.5"><Edit3 className="size-3.5" /> Booking contact number</div>
              <div className="text-xs text-ink-soft mt-0.5">{changePhone ? "Using a different number for this booking" : `Using verified: +91 ${phoneOf(profile)}`}</div>
            </div>
            <span className={`w-11 h-6 rounded-full p-0.5 transition ${changePhone ? "bg-earth" : "bg-border"}`}><span className={`block size-5 rounded-full bg-cream transition ${changePhone ? "translate-x-5" : ""}`} /></span>
          </button>
          {changePhone && (
            <div className="mt-3 flex gap-2">
              <div className="h-12 px-3 rounded-xl bg-card ring-1 ring-border font-semibold text-ink grid place-items-center text-sm">+91</div>
              <input value={d.phone} onChange={(e) => setD({ ...d, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} inputMode="numeric" className="flex-1 h-12 px-3 rounded-xl bg-card ring-1 ring-border font-semibold text-ink outline-none focus:ring-2 focus:ring-earth" />
            </div>
          )}
          <p className="text-[11px] text-ink-soft mt-2">This won't change your profile phone number.</p>
        </div>

        <Field label="Temple Donation (Optional)">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-ink-soft">₹</span>
            <input value={d.donation} onChange={(e) => setD({ ...d, donation: e.target.value.replace(/[^\d.]/g, "") })} inputMode="decimal" placeholder="0" className="w-full h-14 pl-9 pr-4 rounded-2xl bg-card ring-1 ring-border font-semibold text-ink outline-none" />
          </div>
        </Field>
      </div>
      <div className="shrink-0 p-4 bg-card border-t border-border">
        <div className="flex items-center justify-between mb-3"><span className="text-ink-soft text-sm">Order Total</span><span className="text-xl font-bold text-ink">{money(total)}</span></div>
        <button onClick={() => next(d)} disabled={!d.devotee.trim() || d.phone.length < 10 || !d.date} className="w-full h-14 rounded-2xl bg-earth text-primary-foreground font-bold shadow-soft flex items-center justify-center gap-2 disabled:opacity-40">
          Continue to Payment <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <div><label className="block text-sm font-semibold text-ink mb-2">{label} {required && <span className="text-earth">*</span>}</label>{children}</div>;
}

function BookPayment({ draft, back, done }: { draft: BookDraft; back: () => void; done: (code: string) => void }) {
  const qc = useQueryClient();
  const subtotal = draft.poojas.reduce((a, b) => a + Number(b.rate || 0), 0);
  const donation = Number(draft.donation || 0);
  const total = subtotal + donation;

  const pay = useMutation({
    mutationFn: async () => {
      const created = (await bookingApi.create({
        listing_slug: draft.slug,
        devotee_name: draft.devotee,
        contact_number: draft.phone,
        country_code: "+91",
        nakshatra: draft.nakshatra || undefined,
        booking_date: draft.date,
        donation_amount: donation || 0,
        items: draft.poojas.map((p) => ({ pooja_uuid: p.uuid, pooja: p.id, quantity: 1, amount: p.rate })),
      })) as { booking_code?: string; uuid?: string; booking_uuid?: string };

      const code = created?.booking_code;
      const uuid = created?.booking_uuid ?? created?.uuid;
      await bookingApi.checkout({ booking_code: code, booking_uuid: uuid });
      if (!code) throw new Error("Booking created but no booking code was returned.");
      return code;
    },
    onSuccess: (code) => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      done(code);
    },
  });

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <BookHeader back={back} title="Complete Payment" sub="Step 3 of 4" />
      <Stepper step={3} />
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div className="p-5 rounded-3xl bg-card ring-1 ring-border">
          <div className="text-center mb-4">
            <div className="mx-auto size-14 rounded-2xl bg-earth-soft grid place-items-center mb-2"><CreditCard className="size-6 text-earth" /></div>
            <div className="font-serif text-xl text-ink">Order Summary</div>
            <div className="text-xs text-ink-soft">Booking at {draft.title}</div>
          </div>
          <div className="space-y-3 text-sm">
            {draft.poojas.map((p) => <Row key={p.uuid} label={p.name} value={money(p.rate)} />)}
            {donation > 0 && <Row label="Donation" value={money(donation)} />}
            <div className="border-t border-dashed border-border" />
            <Row label="Total Payable" value={money(total)} big bold />
          </div>
        </div>
        {pay.isError && <p className="text-sm text-destructive text-center">{errorText(pay.error)}</p>}
      </div>
      <div className="shrink-0 p-4 bg-card border-t border-border">
        <button onClick={() => pay.mutate()} disabled={pay.isPending} className="w-full h-14 rounded-2xl bg-earth text-primary-foreground font-bold shadow-soft flex items-center justify-center gap-2 disabled:opacity-50">
          {pay.isPending ? <Loader2 className="size-5 animate-spin" /> : null} Pay {money(total)}
        </button>
        <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-ink-soft"><ShieldCheck className="size-3.5 text-verified" />Secured by <span className="font-bold text-[#3395FF]">Razorpay</span></div>
      </div>
    </div>
  );
}

function Row({ label, value, bold, muted, big }: { label: string; value: string; bold?: boolean; muted?: boolean; big?: boolean }) {
  return (
    <div className="flex justify-between items-baseline gap-3">
      <span className={`${muted ? "text-ink-soft" : "text-ink"} ${bold ? "font-semibold" : ""} min-w-0 truncate`}>{label}</span>
      <span className={`${muted ? "text-ink-soft" : "text-ink"} ${big ? "text-xl font-bold text-earth" : bold ? "font-semibold" : ""} shrink-0`}>{value}</span>
    </div>
  );
}

function BookReceipt({ code, home }: { code: string; home: () => void }) {
  const q = useQuery({ queryKey: ["receipt", code], queryFn: () => bookingApi.receipt(code) });
  const b = q.data;
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-card">
      <div className="px-5 pt-5 pb-4 flex items-center justify-between shrink-0">
        <button onClick={home} className="text-sm text-ink-soft font-semibold">← Back to Bookings</button>
        <div className="flex gap-2">
          <button className="size-9 rounded-full bg-muted grid place-items-center"><Download className="size-4 text-ink" /></button>
          <button className="size-9 rounded-full bg-verified grid place-items-center"><Share2 className="size-4 text-white" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
        {q.isLoading && <Loading label="Fetching receipt…" />}
        {q.isError && <ErrorState error={q.error} retry={() => q.refetch()} />}
        {b && (
          <>
            <div className="text-center py-4">
              <div className="mx-auto size-16 rounded-full bg-verified grid place-items-center mb-3 shadow-soft"><Check className="size-8 text-white" strokeWidth={3} /></div>
              <div className="font-serif text-2xl text-ink">Booking {b.status ?? "Confirmed"}</div>
              <div className="font-ml text-sm text-ink-soft mt-1">നിങ്ങളുടെ ബുക്കിംഗ് സ്ഥിരീകരിച്ചു</div>
            </div>
            <div className="rounded-3xl bg-cream ring-1 ring-border overflow-hidden">
              <div className="p-4 border-b border-dashed border-border">
                <div className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">Booking Receipt</div>
                <div className="font-serif text-lg text-earth mt-1">{b.listing_title ?? b.temple_name ?? "TempleAddress"}</div>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <Row label="Booking Code" value={b.booking_code ?? code} />
                {(b.pooja_date ?? b.booking_date) && <Row label="Pooja Date" value={String(b.pooja_date ?? b.booking_date)} />}
                {b.devotee_name && <Row label="Devotee" value={b.devotee_name} />}
                {(b.items ?? []).map((it, i) => <Row key={i} label={it.pooja_name ?? it.name ?? "Pooja"} value={money(it.amount ?? 0)} muted />)}
              </div>
              <div className="p-4 bg-earth-soft/60 border-t border-dashed border-border"><Row label="Total Paid" value={money(b.total_amount ?? 0)} big bold /></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ================= BOOKINGS ================= */
function BookingsList({ goExplore, openReceipt }: { goExplore: () => void; openReceipt: (code: string) => void }) {
  const q = useQuery({ queryKey: ["bookings"], queryFn: bookingApi.list, retry: false });
  const statsQ = useQuery({ queryKey: ["booking-stats"], queryFn: bookingApi.stats, retry: false });
  const bookings = listOf<Booking>(q.data);
  const stats = statsQ.data as Record<string, number | string> | undefined;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <header className="px-5 pt-3 pb-4 bg-card">
        <BrandRow />
        <h1 className="mt-3 text-2xl font-bold text-ink">My Bookings</h1>
        {stats && (
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
            {Object.entries(stats).slice(0, 4).map(([k, v]) => (
              <span key={k} className="shrink-0 px-3 py-1.5 rounded-full bg-muted text-xs font-semibold text-ink-soft">
                {k.replace(/_/g, " ")}: <span className="text-earth">{String(v)}</span>
              </span>
            ))}
          </div>
        )}
      </header>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {q.isLoading && <Loading label="Loading bookings…" />}
        {q.isError && <ErrorState error={q.error} retry={() => q.refetch()} />}
        {!q.isLoading && !q.isError && bookings.length === 0 && (
          <EmptyState icon={CalendarCheck} title="No bookings yet" sub="Your pooja bookings and receipts will appear here." />
        )}
        {bookings.map((b, i) => (
          <button key={b.uuid ?? b.booking_code ?? i} onClick={() => b.booking_code && openReceipt(b.booking_code)} className="w-full text-left rounded-3xl bg-card ring-1 ring-border p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="font-serif text-base text-ink leading-tight truncate">{b.listing_title ?? b.temple_name ?? "Pooja Booking"}</div>
              {b.status && <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 bg-earth-soft text-earth">{b.status}</span>}
            </div>
            <div className="text-xs text-ink-soft mt-0.5">{[b.items?.[0]?.pooja_name ?? b.items?.[0]?.name, b.pooja_date ?? b.booking_date].filter(Boolean).join(" · ")}</div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono text-[10px] text-ink-soft">{b.booking_code}</span>
              <span className="font-serif font-bold text-earth">{money(b.total_amount ?? 0)}</span>
            </div>
          </button>
        ))}
        <button onClick={goExplore} className="w-full mt-4 h-14 rounded-2xl border-2 border-dashed border-earth/40 text-earth font-semibold flex items-center justify-center gap-2"><Plus className="size-5" /> Book a new Pooja</button>
      </div>
    </div>
  );
}

/* ================= PROFILE ================= */
function ProfileScreen({ profile, openRefer, openHub, openListings, onSignOut, goSubmit }: {
  profile: Me; openRefer: () => void; openHub: () => void; openListings: () => void; onSignOut: () => void; goSubmit: () => void;
}) {
  const walletQ = useQuery({ queryKey: ["wallet"], queryFn: authApi.wallet, retry: false });
  const bookingsQ = useQuery({ queryKey: ["bookings"], queryFn: bookingApi.list, retry: false });
  const subsQ = useQuery({ queryKey: ["my-submissions"], queryFn: listingApi.mySubmissions, retry: false });

  const wallet = walletQ.data as { balance?: string | number } | undefined;
  const bookingCount = countOf(bookingsQ.data);
  const submissionCount = countOf(subsQ.data);
  const name = nameOf(profile);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      <div className="bg-gradient-to-br from-earth to-earth/70 px-5 pt-6 pb-8 text-primary-foreground">
        <BrandRow right={<button onClick={onSignOut} className="text-[10px] font-bold px-2 py-1 rounded-full bg-cream/20 text-primary-foreground">SIGN OUT</button>} />
        <div className="flex items-center gap-4 mt-4">
          <div className="size-16 rounded-full bg-cream text-earth grid place-items-center text-2xl font-bold ring-4 ring-cream/30">{name[0]}</div>
          <div className="min-w-0">
            <div className="text-lg font-bold truncate">{name}</div>
            <div className="text-sm text-primary-foreground/80 flex items-center gap-1"><ShieldCheck className="size-3.5" /> +91 {phoneOf(profile)}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-6">
          <Stat n={bookingsQ.isLoading ? "…" : String(bookingCount)} l="Bookings" />
          <Stat n={subsQ.isLoading ? "…" : String(submissionCount)} l="Listings" />
          <Stat n={walletQ.isLoading ? "…" : money(wallet?.balance ?? 0)} l="Wallet" />
        </div>
      </div>

      <div className="p-4 space-y-3 bg-card flex-1">
        <button onClick={openRefer} className="w-full p-4 rounded-2xl bg-gradient-to-r from-gold/25 to-earth/15 ring-1 ring-gold/30 flex items-center gap-3 text-left">
          <div className="size-12 rounded-xl bg-earth grid place-items-center"><Gift className="size-6 text-primary-foreground" /></div>
          <div className="flex-1">
            <div className="font-serif font-bold text-ink">Refer & Share</div>
            <div className="text-xs text-ink-soft">Invite friends and family to TempleAddress</div>
          </div>
          <ChevronRight className="size-5 text-earth" />
        </button>

        <button onClick={goSubmit} className="w-full p-4 rounded-2xl bg-card ring-1 ring-border flex items-center gap-3 text-left">
          <div className="size-12 rounded-xl bg-earth-soft grid place-items-center"><Plus className="size-6 text-earth" /></div>
          <div className="flex-1">
            <div className="font-semibold text-ink">Add Listing</div>
            <div className="text-xs text-ink-soft">Temple, festival, service or local business</div>
          </div>
          <ChevronRight className="size-5 text-earth" />
        </button>

        <button onClick={openListings} className="w-full p-4 rounded-2xl bg-card ring-1 ring-border flex items-center gap-3 text-left">
          <div className="size-12 rounded-xl bg-earth-soft grid place-items-center"><FilePlus2 className="size-6 text-earth" /></div>
          <div className="flex-1">
            <div className="font-semibold text-ink">My Submissions</div>
            <div className="text-xs text-ink-soft">{subsQ.isLoading ? "Loading…" : `${submissionCount} listing${submissionCount === 1 ? "" : "s"} submitted`}</div>
          </div>
          <ChevronRight className="size-5 text-earth" />
        </button>

        <button onClick={openHub} className="w-full p-4 rounded-2xl bg-card ring-1 ring-border flex items-center gap-3 text-left">
          <div className="size-12 rounded-xl bg-earth-soft grid place-items-center"><Sparkles className="size-6 text-earth" /></div>
          <div className="flex-1">
            <div className="font-semibold text-ink">Add Full Listing Details</div>
            <div className="text-xs text-ink-soft">Guided step-by-step listing helper</div>
          </div>
          <ChevronRight className="size-5 text-earth" />
        </button>

        <div className="pt-2 space-y-2">
          {[
            { i: Wallet, l: "Wallet", s: walletQ.isError ? "Unavailable" : money(wallet?.balance ?? 0) },
            { i: Bell, l: "Notifications", s: "Temple alerts & booking updates" },
            { i: Share2, l: "Share TempleAddress", s: "Send app to friends & family" },
            { i: User, l: "Language", s: "English · Malayalam" },
          ].map((it) => (
            <div key={it.l} className="w-full p-3 rounded-2xl bg-muted flex items-center gap-3">
              <div className="size-11 rounded-xl bg-earth-soft grid place-items-center"><it.i className="size-5 text-earth" /></div>
              <div className="flex-1 text-left"><div className="font-semibold text-ink text-sm">{it.l}</div><div className="text-xs text-ink-soft">{it.s}</div></div>
              <ChevronRight className="size-4 text-ink-soft" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return <div className="rounded-2xl bg-cream/15 backdrop-blur px-3 py-2.5 text-center"><div className="font-serif text-xl truncate">{n}</div><div className="text-[10px] uppercase tracking-wider text-primary-foreground/80">{l}</div></div>;
}

/* ================= REFER & SHARE ================= */
function ReferEarn({ profile, back }: { profile: Me; back: () => void }) {
  const code = profile.referral_code ?? "";
  const link = typeof window !== "undefined" ? `${window.location.origin}${code ? `?ref=${code}` : ""}` : "";

  const share = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: "TempleAddress", text: "Book poojas and discover temples on TempleAddress", url: link }); } catch { /* dismissed */ }
    } else if (typeof navigator !== "undefined") {
      await navigator.clipboard.writeText(link);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-card">
      <header className="px-5 pt-3 pb-4 flex items-center gap-3">
        <button onClick={back} className="size-10 rounded-full bg-muted grid place-items-center"><ArrowLeft className="size-5 text-ink" /></button>
        <div className="text-lg font-bold text-ink">Refer & Share</div>
      </header>
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="rounded-3xl bg-gradient-to-br from-earth to-gold p-6 text-primary-foreground text-center">
          <Gift className="size-12 mx-auto mb-3" />
          <div className="font-serif text-2xl font-bold">Invite fellow devotees</div>
          <div className="text-sm mt-1 opacity-90">Share TempleAddress so they can find temples and book poojas easily</div>
        </div>

        <div className="mt-5">
          <div className="text-xs font-semibold text-ink-soft uppercase tracking-wider mb-2">Your referral code</div>
          {code ? (
            <div className="p-4 rounded-2xl bg-earth-soft flex items-center justify-between">
              <div className="font-serif text-2xl font-bold text-earth tracking-widest">{code}</div>
              <button onClick={() => navigator.clipboard.writeText(code)} className="h-10 px-4 rounded-full bg-earth text-primary-foreground text-sm font-bold">Copy</button>
            </div>
          ) : (
            <EmptyState icon={Gift} title="No referral code yet" sub="Your account doesn't have a referral code assigned." />
          )}
        </div>

        <div className="mt-5 grid grid-cols-4 gap-3">
          {[
            { i: MessageCircle, l: "WhatsApp", a: () => window.open(`https://wa.me/?text=${encodeURIComponent(`Book poojas on TempleAddress ${link}`)}`, "_blank") },
            { i: Share2, l: "Share", a: share },
            { i: FileText, l: "SMS", a: () => window.open(`sms:?body=${encodeURIComponent(`Book poojas on TempleAddress ${link}`)}`) },
            { i: Users, l: "Copy link", a: () => navigator.clipboard.writeText(link) },
          ].map((x) => (
            <button key={x.l} onClick={x.a} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-muted">
              <div className="size-11 rounded-full bg-earth grid place-items-center"><x.i className="size-5 text-primary-foreground" /></div>
              <span className="text-[11px] font-semibold text-ink text-center leading-tight">{x.l}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
