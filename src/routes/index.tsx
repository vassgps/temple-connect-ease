import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  MessageCircle, Compass, CalendarCheck, FilePlus2, User,
  Search, Phone, Video, MoreVertical, ArrowLeft, Plus, Mic, Smile,
  MapPin, Star, ShieldCheck, ChevronRight, Check, CheckCheck,
  Flame, Sparkles, Heart, CalendarDays, CreditCard, Share2, Download,
  Image as ImageIcon, FileText, Camera, Bot, Gift, Wallet, BarChart3,
  Bell, Users, Send, X, Megaphone, Edit3,
} from "lucide-react";
import temple1 from "@/assets/temple-1.jpg";
import temple2 from "@/assets/temple-2.jpg";
import temple3 from "@/assets/temple-3.jpg";
import temple4 from "@/assets/temple-4.jpg";
import logoMarkAsset from "@/assets/logo-mark.png.asset.json";
import logoFullAsset from "@/assets/logo-full.png.asset.json";
import { ListingHub, MyListings, MeenakshiFlow, type FlowKind } from "@/components/listing-flow";
import { SubmitScreen, type SubmitKind } from "@/components/quick-submit";
import meenakshiImg from "@/assets/meenakshi.jpg";



const logoMark = logoMarkAsset.url;
const logoFull = logoFullAsset.url;

export const Route = createFileRoute("/")({
  component: App,
});

type Tab = "chats" | "explore" | "bookings" | "submit" | "profile";
type View =
  | { name: "tab" }
  | { name: "chat"; id: string }
  | { name: "ai-chat" }
  | { name: "temple"; id: number }
  | { name: "book-select"; id: number }
  | { name: "book-details"; id: number }
  | { name: "book-payment"; id: number }
  | { name: "book-receipt"; id: number }
  | { name: "refer" }
  | { name: "agent" }
  | { name: "listing-hub" }
  | { name: "my-listings" }
  | { name: "meenakshi"; kind: FlowKind }
  | { name: "events" };


type Profile = { name: string; phone: string } | null;

const temples = [
  { id: 1, name: "Vaikom Mahadeva Temple", ml: "വൈക്കം മഹാദേവ ക്ഷേത്രം", loc: "Vaikom, Kottayam", dist: "2.4 km", img: temple1, verified: true, pooja: true, deity: "Shiva", code: "T1028", subscribed: true },
  { id: 2, name: "Guruvayur Sree Krishna", ml: "ഗുരുവായൂർ ശ്രീ കൃഷ്ണ ക്ഷേത്രം", loc: "Thrissur, Kerala", dist: "18 km", img: temple3, verified: true, pooja: true, deity: "Krishna", code: "T1104", subscribed: true },
  { id: 3, name: "Kottur Sri Mahavishnu", ml: "കോട്ടൂർ ശ്രീ മഹാവിഷ്ണു ക്ഷേത്രം", loc: "Kozhikode", dist: "42 km", img: temple2, verified: true, pooja: true, deity: "Vishnu", code: "T1091", subscribed: false },
  { id: 4, name: "Ambalappuzha Sree Krishna", ml: "അമ്പലപ്പുഴ ശ്രീ കൃഷ്ണ ക്ഷേത്രം", loc: "Alappuzha", dist: "55 km", img: temple4, verified: false, pooja: true, deity: "Krishna", code: "T1223", subscribed: false },
];

const poojas = [
  { id: "p1", name: "Pushpanjali", ml: "പുഷ്പാഞ്ജലി", desc: "Offering of flowers for prosperity", price: 150, cat: "Daily" },
  { id: "p2", name: "Neyvilakku", ml: "നെയ്‌വിളക്ക്", desc: "Ghee lamp offering", price: 100, cat: "Daily" },
  { id: "p3", name: "Ganapathi Homam", ml: "ഗണപതി ഹോമം", desc: "Special ritual to remove obstacles", price: 501, cat: "Special" },
  { id: "p4", name: "Sahasranamam", ml: "സഹസ്രനാമം", desc: "Chanting of 1000 names", price: 250, cat: "Daily" },
];

const events = [
  { id: "e1", title: "Pradosha Pooja", ml: "പ്രദോഷ പൂജ", date: "Tomorrow · 5:30 PM", templeId: 1, kind: "Special Pooja", img: temple1 },
  { id: "e2", title: "Ekadashi Celebration", ml: "ഏകാദശി", date: "22 Jul · Full day", templeId: 2, kind: "Festival", img: temple3 },
  { id: "e3", title: "Ashtami Rohini", ml: "അഷ്ടമി രോഹിണി", date: "26 Jul · Krishna Jayanthi", templeId: 4, kind: "Festival", img: temple4 },
  { id: "e4", title: "Navaratri Begins", ml: "നവരാത്രി", date: "3 Oct · 9 days", templeId: 3, kind: "Festival", img: temple2 },
];

const sponsorAds = [
  { id: "a1", brand: "Kalyan Silks", tag: "Sponsored", copy: "Festive collection · Free delivery in Kerala", cta: "Shop Now", accent: "from-gold/40 to-earth/20" },
  { id: "a2", brand: "SBI Devotee Card", tag: "Ad", copy: "0% charges on pooja bookings this month", cta: "Apply", accent: "from-verified/25 to-earth/10" },
];

const chats = [
  { id: "c1", name: "Vaikom Mahadeva Temple", ml: "വൈക്കം മഹാദേവ", last: "🙏 Pradosha Pooja tomorrow at 5:30 PM.", time: "10:45", unread: 2, group: true, avatar: temple1, official: true },
  { id: "c2", name: "Kottur Sree Mahavishnu", last: "Your booking TPB-1784...6138 is confirmed.", time: "2:14 PM", unread: 1, group: false, avatar: temple2, official: true },
  { id: "c3", name: "Ramesh Pandit Ji", ml: "രമേശ്", last: "Namaskaram. I will reach by 5 PM.", time: "Yesterday", unread: 0, group: false, avatar: null, initials: "RP" },
  { id: "c4", name: "Guruvayur Devotees", last: "Anitha: Ekadashi photos 📷", time: "Yesterday", unread: 5, group: true, avatar: temple3 },
  { id: "c5", name: "Ravi (Electrician)", last: "Light repair done ✓", time: "Mon", unread: 0, group: false, avatar: null, initials: "RV", service: true },
];




function App() {
  const [tab, setTab] = useState<Tab>("chats");
  const [view, setView] = useState<View>({ name: "tab" });
  const [profile, setProfile] = useState<Profile>(null);

  return (
    <div className="min-h-screen w-full bg-[oklch(0.88_0.02_60)] flex items-center justify-center md:p-8">
      <div className="relative w-full max-w-[420px] h-[100dvh] md:h-[860px] md:rounded-[44px] bg-cream overflow-hidden md:shadow-frame md:ring-1 md:ring-black/5 flex flex-col">
        <div className="h-6 md:h-8 shrink-0 bg-transparent" />

        {!profile ? (
          <Onboarding onDone={(p) => setProfile(p)} />
        ) : (
          <>
            <div className="flex-1 min-h-0 flex flex-col">
              {view.name === "tab" && <TabView tab={tab} setView={setView} setTab={setTab} profile={profile} />}
              {view.name === "ai-chat" && <AIChat back={() => setView({ name: "tab" })} />}
              {view.name === "chat" && <ChatDetail chatId={view.id} back={() => setView({ name: "tab" })} />}
              {view.name === "temple" && <TempleDetail id={view.id} back={() => setView({ name: "tab" })} book={() => setView({ name: "book-select", id: view.id })} />}
              {view.name === "book-select" && <BookSelect id={view.id} back={() => setView({ name: "temple", id: view.id })} next={() => setView({ name: "book-details", id: view.id })} />}
              {view.name === "book-details" && <BookDetails id={view.id} profile={profile} back={() => setView({ name: "book-select", id: view.id })} next={() => setView({ name: "book-payment", id: view.id })} />}
              {view.name === "book-payment" && <BookPayment id={view.id} back={() => setView({ name: "book-details", id: view.id })} next={() => setView({ name: "book-receipt", id: view.id })} />}
              {view.name === "book-receipt" && <BookReceipt id={view.id} home={() => { setView({ name: "tab" }); setTab("bookings"); }} />}
              {view.name === "refer" && <ReferEarn back={() => setView({ name: "tab" })} />}
              {view.name === "agent" && <AgentDashboard back={() => setView({ name: "tab" })} openHub={() => setView({ name: "listing-hub" })} openListings={() => setView({ name: "my-listings" })} />}
              {view.name === "listing-hub" && <ListingHub phone={profile.phone} back={() => setView({ name: "tab" })} start={(k) => setView({ name: "meenakshi", kind: k })} openListings={() => setView({ name: "my-listings" })} />}
              {view.name === "my-listings" && <MyListings back={() => setView({ name: "listing-hub" })} />}
              {view.name === "meenakshi" && <MeenakshiFlow kind={view.kind} phone={profile.phone} back={() => setView({ name: "listing-hub" })} onSubmitted={() => setView({ name: "my-listings" })} />}
              {view.name === "events" && <EventsFeed back={() => setView({ name: "tab" })} open={(id) => setView({ name: "temple", id })} />}

            </div>
            {view.name === "tab" && <BottomNav tab={tab} setTab={setTab} />}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- ONBOARDING (name + mobile + OTP once) ---------------- */
function Onboarding({ onDone }: { onDone: (p: { name: string; phone: string }) => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);

  return (
    <div className="flex-1 flex flex-col min-h-0 px-6 pb-8">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
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
                <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" placeholder="10-digit number" className="flex-1 h-14 px-4 rounded-2xl bg-card ring-1 ring-border font-semibold text-ink outline-none focus:ring-2 focus:ring-earth" />
              </div>
              <p className="text-xs text-ink-soft mt-1.5">Asked only once. We'll never ask again on bookings.</p>
            </div>
          </div>
        ) : (
          <div className="w-full mt-8 text-left">
            <label className="block text-sm font-semibold text-ink mb-2">Enter OTP sent to +91 {phone || "94966 86256"}</label>
            <div className="flex gap-3 justify-center mt-2">
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
                    if (d) {
                      const next = e.target.parentElement?.children[i + 1] as HTMLInputElement | undefined;
                      next?.focus();
                    }
                  }}
                  className="size-14 text-center rounded-2xl bg-card ring-1 ring-border font-bold text-2xl text-ink outline-none focus:ring-2 focus:ring-earth"
                />
              ))}
            </div>
            <p className="text-xs text-ink-soft mt-3 text-center">Didn't get code? <span className="text-earth font-semibold">Resend in 0:24</span></p>
          </div>
        )}
      </div>

      <button
        onClick={() => {
          if (step === 1) setStep(2);
          else onDone({ name: name || "Anand Nambissan", phone: phone || "9496686256" });
        }}
        disabled={step === 1 && (!name || phone.length < 10)}
        className="w-full h-14 rounded-2xl bg-earth text-primary-foreground font-bold shadow-soft flex items-center justify-center gap-2 disabled:opacity-40"
      >
        {step === 1 ? "Send OTP" : "Verify & Continue"} <ChevronRight className="size-5" />
      </button>
      <p className="text-[11px] text-ink-soft text-center mt-3">By continuing you agree to TempleAddress Terms.</p>
    </div>
  );
}

/* ---------------- Bottom Nav ---------------- */
function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items: { id: Tab; label: string; icon: typeof MessageCircle; badge?: number }[] = [
    { id: "chats", label: "Chats", icon: MessageCircle, badge: 8 },
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

function TabView({ tab, setView, setTab, profile }: { tab: Tab; setView: (v: View) => void; setTab: (t: Tab) => void; profile: { name: string; phone: string } }) {
  if (tab === "chats") return <ChatsList open={(id) => setView({ name: "chat", id })} openAI={() => setView({ name: "ai-chat" })} />;
  if (tab === "explore") return <ExploreTemples open={(id) => setView({ name: "temple", id })} openEvents={() => setView({ name: "events" })} />;
  if (tab === "bookings") return <BookingsList open={(id) => setView({ name: "temple", id })} goExplore={() => setTab("explore")} />;
  if (tab === "submit") return <SubmitScreen logoMark={logoMark} openFullFlow={(k: SubmitKind) => setView({ name: "meenakshi", kind: k === "festival" ? "event" : k })} />;

  return <ProfileScreen profile={profile} openRefer={() => setView({ name: "refer" })} openAgent={() => setView({ name: "agent" })} openHub={() => setView({ name: "listing-hub" })} />;
}

/* ---------------- BRAND HEADER ---------------- */
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

/* ---------------- CHATS LIST ---------------- */
function ChatsList({ open, openAI }: { open: (id: string) => void; openAI: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <header className="px-5 pt-3 pb-4 bg-card">
        <BrandRow right={
          <div className="flex gap-2">
            <button className="size-10 rounded-full bg-muted grid place-items-center"><Search className="size-5 text-ink-soft" /></button>
            <button className="size-10 rounded-full bg-earth-soft grid place-items-center"><Plus className="size-5 text-earth" /></button>
          </div>
        } />
        <h1 className="mt-3 text-2xl font-bold text-ink">Chats</h1>
        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
          <Chip active>All</Chip><Chip>Temples</Chip><Chip>Groups</Chip><Chip>Services</Chip><Chip>Unread</Chip>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-card">
        {/* PINNED: Meenakshi — AI assistant */}
        <button onClick={openAI} className="w-full px-5 py-4 flex gap-4 items-center bg-gradient-to-r from-earth-soft/70 to-gold/20 border-b border-border/50 active:opacity-80">
          <div className="relative shrink-0">
            <img src={meenakshiImg} alt="Meenakshi" width={816} height={816} loading="lazy" className="size-14 rounded-full object-cover object-top ring-2 ring-cream" />
            <span className="absolute -bottom-0.5 -right-0.5 size-5 rounded-full bg-verified ring-2 ring-cream grid place-items-center">
              <Bot className="size-3 text-white" />
            </span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="flex justify-between items-baseline gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-bold text-ink truncate">Meenakshi</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-earth text-primary-foreground uppercase">AI</span>
              </div>
              <span className="text-xs text-ink-soft shrink-0">Always on</span>
            </div>
            <p className="text-sm text-ink-soft truncate mt-0.5">Ask about temples, poojas, festivals or your bookings…</p>
          </div>
        </button>




        {chats.map((c, i) => (
          <button key={c.id} onClick={() => open(c.id)} className={`w-full px-5 py-4 flex gap-4 items-center active:bg-muted ${i !== chats.length - 1 ? "border-b border-border/50" : ""}`}>
            <Avatar name={c.name} img={c.avatar} initials={c.initials} size={56} />
            <div className="flex-1 min-w-0 text-left">
              <div className="flex justify-between items-baseline gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-semibold text-ink truncate">{c.name}</span>
                  {c.official && <ShieldCheck className="size-4 text-verified shrink-0" />}
                  {c.service && <Sparkles className="size-3.5 text-gold shrink-0" />}
                </div>
                <span className={`text-xs shrink-0 ${c.unread ? "text-earth font-semibold" : "text-ink-soft"}`}>{c.time}</span>
              </div>
              <div className="flex justify-between items-center mt-1 gap-2">
                <p className={`text-sm truncate ${c.unread ? "text-ink" : "text-ink-soft"}`}>{c.last}</p>
                {c.unread ? (
                  <span className="min-w-5 h-5 px-1.5 rounded-full bg-earth text-primary-foreground text-[11px] font-bold grid place-items-center shrink-0">{c.unread}</span>
                ) : (
                  <CheckCheck className="size-4 text-verified shrink-0" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Chip({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return <span className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold ${active ? "bg-earth text-primary-foreground" : "bg-muted text-ink-soft"}`}>{children}</span>;
}

function Avatar({ name, img, initials, size = 48 }: { name: string; img?: string | null; initials?: string; size?: number }) {
  const style = { width: size, height: size };
  if (img) return <img src={img} alt={name} style={style} className="rounded-full object-cover ring-1 ring-black/5 shrink-0" loading="lazy" />;
  const label = initials ?? name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  return <div style={style} className="rounded-full bg-gradient-to-br from-earth-soft to-earth/30 grid place-items-center font-bold text-earth shrink-0">{label}</div>;
}

/* ---------------- AI CHAT (Ask TempleAddress) ---------------- */
type AIMsg = { id: number; from: "me" | "ai"; text?: string; kind?: "text" | "image" | "file" | "voice"; meta?: string };

function AIChat({ back }: { back: () => void }) {
  const [msgs, setMsgs] = useState<AIMsg[]>([
    { id: 1, from: "ai", text: "🙏 Namaskaram! I'm TempleAddress AI. Ask me about any temple, pooja, or festival — in English or Malayalam." },
    { id: 2, from: "ai", text: "Try: \"Find Shiva temples near Vaikom\", \"When is next Ekadashi?\", or upload a temple photo to identify it." },
  ]);
  const [input, setInput] = useState("");
  const [showAttach, setShowAttach] = useState(false);

  const suggestions = ["Nearby temples", "Next festival", "Book Pushpanjali", "Malayalam pooja list"];

  const send = (text?: string, kind: "text" | "image" | "file" | "voice" = "text", meta?: string) => {
    const t = text ?? input.trim();
    if (!t && kind === "text") return;
    const userMsg: AIMsg = { id: Date.now(), from: "me", text: t, kind, meta };
    setMsgs((m) => [...m, userMsg]);
    setInput("");
    setShowAttach(false);
    setTimeout(() => {
      const reply: AIMsg = {
        id: Date.now() + 1, from: "ai",
        text: kind === "image" ? "I can see the gopuram — this looks like Vaikom Mahadeva Temple. Would you like to book a pooja here?" :
              kind === "voice" ? "Got your voice note. The nearest Shiva temple with Pradosha pooja tomorrow is Vaikom Mahadeva (2.4 km)." :
              kind === "file" ? "Received your file. I'll extract the booking details and confirm shortly." :
              "Here are 3 temples matching your query. Tap any to view details and book. 🕉️",
      };
      setMsgs((m) => [...m, reply]);
    }, 700);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-chat-bg">
      <header className="px-3 py-3 bg-card border-b border-border flex items-center gap-3 shrink-0">
        <button onClick={back} className="size-10 grid place-items-center"><ArrowLeft className="size-5 text-ink" /></button>
        <div className="size-10 rounded-full bg-gradient-to-br from-earth to-gold grid place-items-center ring-2 ring-cream">
          <img src={logoMark} alt="" className="size-7" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-ink flex items-center gap-1.5">
            Ask TempleAddress <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-earth text-primary-foreground">AI</span>
          </div>
          <div className="text-xs text-verified flex items-center gap-1"><Bot className="size-3" /> Powered by TempleAddress AI</div>
        </div>
        <button className="size-10 grid place-items-center"><MoreVertical className="size-5 text-ink-soft" /></button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2" style={{ backgroundImage: "radial-gradient(oklch(0.9 0.02 60) 1px, transparent 1px)", backgroundSize: "18px 18px" }}>
        {msgs.map((m) => (
          <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[82%] px-3.5 py-2 rounded-2xl shadow-sm ${m.from === "me" ? "bg-chat-out text-ink rounded-br-md" : "bg-chat-in text-ink rounded-bl-md"}`}>
              {m.kind === "image" && <div className="mb-1 rounded-lg bg-earth-soft/60 p-8 grid place-items-center"><ImageIcon className="size-8 text-earth" /></div>}
              {m.kind === "file" && <div className="mb-1 flex items-center gap-2 p-2 bg-cream/60 rounded-lg"><FileText className="size-5 text-earth" /><span className="text-xs font-semibold">{m.meta ?? "document.pdf"}</span></div>}
              {m.kind === "voice" && <div className="mb-1 flex items-center gap-2 p-2 bg-cream/60 rounded-lg"><Mic className="size-4 text-earth" /><span className="text-xs">Voice · 0:{m.meta ?? "12"}</span></div>}
              {m.text && <p className="text-[15px] leading-snug whitespace-pre-wrap">{m.text}</p>}
            </div>
          </div>
        ))}
        <div className="pt-2 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button key={s} onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full bg-cream ring-1 ring-earth/30 text-earth font-semibold">{s}</button>
          ))}
        </div>
      </div>

      {showAttach && (
        <div className="mx-2 mb-2 p-3 rounded-2xl bg-card shadow-soft grid grid-cols-4 gap-2">
          {[
            { i: Camera, l: "Camera", a: () => send("", "image") },
            { i: ImageIcon, l: "Photo", a: () => send("", "image") },
            { i: FileText, l: "File", a: () => send("", "file", "receipt.pdf") },
            { i: Mic, l: "Voice", a: () => send("", "voice", "18") },
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
          <button onClick={() => (input.trim() ? send() : send("", "voice", "05"))} className="size-12 rounded-full bg-earth grid place-items-center shadow-soft">
            {input.trim() ? <Send className="size-5 text-primary-foreground" /> : <Mic className="size-5 text-primary-foreground" />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- CHAT DETAIL ---------------- */
function ChatDetail({ chatId, back }: { chatId: string; back: () => void }) {
  const chat = chats.find((c) => c.id === chatId) ?? chats[0];
  const messages = [
    { id: 1, from: "them", text: "Namaskaram 🙏", time: "10:30" },
    { id: 2, from: "them", text: "Tomorrow is Pradosham. Special Rudrabhishekam pooja at 5:30 PM.", time: "10:31" },
    { id: 3, from: "me", text: "Great! Can I book Pushpanjali for my son?", time: "10:42" },
    { id: 4, from: "them", text: "Yes. Please share his name and nakshatra.", time: "10:43" },
    { id: 5, from: "me", text: "Arjun, Rohini nakshatra 🌟", time: "10:44" },
    { id: 6, from: "them", text: "Booking confirmed. See you tomorrow.", time: "10:45" },
  ];
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-chat-bg">
      <header className="px-3 py-3 bg-card border-b border-border flex items-center gap-3 shrink-0">
        <button onClick={back} className="size-10 grid place-items-center"><ArrowLeft className="size-5 text-ink" /></button>
        <Avatar name={chat.name} img={chat.avatar} initials={chat.initials} size={40} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-ink truncate flex items-center gap-1.5">{chat.name}{chat.official && <ShieldCheck className="size-4 text-verified" />}</div>
          <div className="text-xs text-verified">online</div>
        </div>
        <button className="size-10 grid place-items-center"><Video className="size-5 text-ink-soft" /></button>
        <button className="size-10 grid place-items-center"><Phone className="size-5 text-ink-soft" /></button>
      </header>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2" style={{ backgroundImage: "radial-gradient(oklch(0.9 0.02 60) 1px, transparent 1px)", backgroundSize: "18px 18px" }}>
        <div className="text-center my-3"><span className="text-[11px] bg-cream/80 text-ink-soft px-3 py-1 rounded-full font-medium">Today</span></div>
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-3.5 py-2 rounded-2xl shadow-sm ${m.from === "me" ? "bg-chat-out text-ink rounded-br-md" : "bg-chat-in text-ink rounded-bl-md"}`}>
              <p className="text-[15px] leading-snug">{m.text}</p>
              <div className="flex items-center gap-1 justify-end mt-0.5 text-ink-soft">
                <span className="text-[10px]">{m.time}</span>
                {m.from === "me" && <CheckCheck className="size-3 text-verified" />}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-card rounded-full px-4 py-2.5 shadow-sm">
            <Plus className="size-5 text-ink-soft" />
            <input placeholder="Message" className="flex-1 bg-transparent outline-none text-[15px]" />
            <Camera className="size-5 text-ink-soft" />
          </div>
          <button className="size-12 rounded-full bg-earth grid place-items-center shadow-soft"><Mic className="size-5 text-primary-foreground" /></button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- EXPLORE TEMPLES ---------------- */
function ExploreTemples({ open, openEvents }: { open: (id: number) => void; openEvents: () => void }) {
  const subscribed = temples.filter((t) => t.subscribed);
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <header className="px-5 pt-3 pb-4 bg-card">
        <BrandRow right={
          <button className="h-10 px-3 rounded-full bg-muted flex items-center gap-1.5 text-xs font-semibold text-ink">
            <MapPin className="size-4 text-earth" /> Vaikom
          </button>
        } />
        <div className="mt-4 relative">
          <Search className="size-5 text-ink-soft absolute left-4 top-1/2 -translate-y-1/2" />
          <input placeholder="Search temples, poojas, festivals…" className="w-full h-13 pl-12 pr-4 py-3.5 rounded-2xl bg-muted text-[15px] outline-none placeholder:text-ink-soft" />
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
          <Chip active>Near Me</Chip><Chip>Verified</Chip><Chip>Pooja Open</Chip><Chip>Festivals</Chip><Chip>Kerala</Chip>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-6">
        {/* Sponsor Ad */}
        <div className="px-5 pt-4">
          <SponsorCard ad={sponsorAds[0]} />
        </div>

        {/* Upcoming events (subscribed + nearby) */}
        <div className="px-5 pt-5">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-serif text-lg text-ink">Upcoming Events & Festivals</h2>
            <button onClick={openEvents} className="text-xs text-earth font-semibold">See all</button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5">
            {events.map((e) => {
              const t = temples.find((x) => x.id === e.templeId)!;
              return (
                <button key={e.id} onClick={() => open(e.templeId)} className="w-56 shrink-0 rounded-2xl overflow-hidden bg-card ring-1 ring-border text-left active:scale-[0.98] transition">
                  <div className="relative h-24">
                    <img src={e.img} alt={e.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-earth text-primary-foreground text-[9px] font-bold uppercase">{e.kind}</span>
                    {t.subscribed && <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-cream/95 text-verified text-[9px] font-bold flex items-center gap-0.5"><Bell className="size-2.5" /> Sub</span>}
                  </div>
                  <div className="p-3">
                    <div className="font-semibold text-ink text-sm leading-tight">{e.title}</div>
                    <div className="font-ml text-[11px] text-ink-soft">{e.ml}</div>
                    <div className="text-xs text-earth font-semibold mt-1.5">{e.date}</div>
                    <div className="text-[11px] text-ink-soft truncate">{t.name}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subscribed temples updates */}
        {subscribed.length > 0 && (
          <div className="px-5 pt-6">
            <h2 className="font-serif text-lg text-ink mb-3">From Your Subscribed Temples</h2>
            <div className="space-y-2">
              {subscribed.map((t) => (
                <button key={t.id} onClick={() => open(t.id)} className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card ring-1 ring-border active:bg-muted text-left">
                  <img src={t.img} alt={t.name} className="size-12 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink text-sm truncate">{t.name}</div>
                    <div className="text-xs text-ink-soft truncate">Special pooja tomorrow · New announcement</div>
                  </div>
                  <div className="size-8 rounded-full bg-earth-soft grid place-items-center"><Bell className="size-4 text-earth" /></div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Nearby temples */}
        <div className="px-5 pt-6">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-serif text-lg text-ink">Temples near you</h2>
            <span className="text-xs text-ink-soft">40 results</span>
          </div>
          <div className="space-y-4">
            {temples.map((t) => (
              <button key={t.id} onClick={() => open(t.id)} className="w-full bg-card rounded-3xl overflow-hidden shadow-soft ring-1 ring-black/5 active:scale-[0.99] transition text-left">
                <div className="relative">
                  <img src={t.img} alt={t.name} width={800} height={600} loading="lazy" className="w-full aspect-[16/10] object-cover" />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {t.verified && <span className="px-2 py-1 rounded-md bg-cream/95 text-verified text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><ShieldCheck className="size-3" /> Verified</span>}
                    {t.pooja && <span className="px-2 py-1 rounded-md bg-earth text-primary-foreground text-[10px] font-bold uppercase tracking-wider">Pooja Open</span>}
                  </div>
                  <button className="absolute top-3 right-3 size-9 rounded-full bg-cream/90 grid place-items-center backdrop-blur"><Heart className="size-4 text-earth" /></button>
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-lg text-ink leading-tight">{t.name}</h3>
                  <div className="font-ml text-sm text-ink-soft mt-0.5">{t.ml}</div>
                  <div className="mt-3 flex items-center gap-4 text-sm text-ink-soft">
                    <span className="flex items-center gap-1"><MapPin className="size-4" />{t.loc}</span>
                    <span>·</span><span className="text-earth font-semibold">{t.dist}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Second ad */}
        <div className="px-5 pt-5">
          <SponsorCard ad={sponsorAds[1]} />
        </div>

        {/* Service professionals */}
        <div className="px-5 pt-6">
          <h2 className="font-serif text-lg text-ink mb-3">Service Professionals</h2>
          <div className="space-y-2">
            {[
              { n: "Ramesh Nambissan", role: "Priest / പുരോഹിതൻ", d: "1.8 km", init: "RN" },
              { n: "Ravi Kumar", role: "Electrician", d: "1.2 km", init: "RK" },
              { n: "Meera Flowers", role: "Flower Supplier", d: "3.1 km", init: "MF" },
              { n: "Krishna Sound", role: "PA / Sound Setup", d: "4.5 km", init: "KS" },
            ].map((p) => (
              <div key={p.n} className="p-3 rounded-2xl bg-card ring-1 ring-border flex items-center gap-3">
                <div className="size-11 rounded-xl bg-gradient-to-br from-gold/30 to-earth/20 grid place-items-center font-bold text-earth">{p.init}</div>
                <div className="flex-1">
                  <div className="font-semibold text-ink text-sm">{p.n}</div>
                  <div className="text-xs text-ink-soft">{p.role} · {p.d}</div>
                </div>
                <button className="size-10 rounded-full bg-earth grid place-items-center"><MessageCircle className="size-4 text-primary-foreground" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SponsorCard({ ad }: { ad: typeof sponsorAds[number] }) {
  return (
    <div className={`rounded-2xl p-4 bg-gradient-to-r ${ad.accent} ring-1 ring-border relative overflow-hidden`}>
      <div className="flex items-center gap-1 mb-1">
        <Megaphone className="size-3 text-ink-soft" />
        <span className="text-[10px] uppercase tracking-wider font-bold text-ink-soft">{ad.tag}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-serif text-base text-ink font-bold">{ad.brand}</div>
          <div className="text-xs text-ink-soft mt-0.5">{ad.copy}</div>
        </div>
        <button className="shrink-0 h-9 px-4 rounded-full bg-earth text-primary-foreground text-xs font-bold">{ad.cta}</button>
      </div>
    </div>
  );
}

/* ---------------- EVENTS FEED ---------------- */
function EventsFeed({ back, open }: { back: () => void; open: (id: number) => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <header className="px-5 pt-3 pb-4 bg-card flex items-center gap-3">
        <button onClick={back} className="size-10 rounded-full bg-muted grid place-items-center"><ArrowLeft className="size-5 text-ink" /></button>
        <div>
          <div className="text-lg font-bold text-ink">Events & Festivals</div>
          <div className="text-xs text-ink-soft">Near you & subscribed temples</div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {events.map((e) => {
          const t = temples.find((x) => x.id === e.templeId)!;
          return (
            <button key={e.id} onClick={() => open(e.templeId)} className="w-full flex gap-3 p-3 rounded-2xl bg-card ring-1 ring-border text-left">
              <img src={e.img} alt={e.title} className="size-20 rounded-2xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5"><span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-earth text-primary-foreground uppercase">{e.kind}</span>{t.subscribed && <span className="text-[9px] font-bold text-verified flex items-center gap-0.5"><Bell className="size-2.5" /> Subscribed</span>}</div>
                <div className="font-semibold text-ink mt-1">{e.title}</div>
                <div className="font-ml text-xs text-ink-soft">{e.ml}</div>
                <div className="text-xs text-earth font-semibold mt-1">{e.date}</div>
                <div className="text-[11px] text-ink-soft truncate">{t.name}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- TEMPLE DETAIL ---------------- */
function TempleDetail({ id, back, book }: { id: number; back: () => void; book: () => void }) {
  const t = temples.find((x) => x.id === id) ?? temples[0];
  const templeEvents = events.filter((e) => e.templeId === id);
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="relative shrink-0">
        <img src={t.img} alt={t.name} className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
        <button onClick={back} className="absolute top-3 left-3 size-10 rounded-full bg-cream/95 grid place-items-center"><ArrowLeft className="size-5 text-ink" /></button>
        <div className="absolute top-3 right-3 flex gap-2">
          <button className="size-10 rounded-full bg-cream/95 grid place-items-center"><Share2 className="size-4 text-ink" /></button>
          <button className="size-10 rounded-full bg-cream/95 grid place-items-center"><Bell className="size-4 text-earth" /></button>
        </div>
        <div className="absolute bottom-4 left-5 right-5 text-white">
          <div className="flex gap-1.5 mb-2">
            {t.verified && <span className="px-2 py-0.5 rounded bg-verified text-white text-[10px] font-bold uppercase">Verified</span>}
            {t.subscribed && <span className="px-2 py-0.5 rounded bg-earth text-white text-[10px] font-bold uppercase">Subscribed</span>}
          </div>
          <h1 className="font-serif text-2xl leading-tight">{t.name}</h1>
          <p className="font-ml text-sm text-white/90 mt-0.5">{t.ml}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-card">
        <div className="flex border-b border-border sticky top-0 bg-card z-10">
          {["Basic Info", "Poojas", "Events", "Gallery"].map((tab, i) => (
            <button key={tab} className={`flex-1 py-3.5 text-sm font-semibold ${i === 0 ? "text-earth border-b-2 border-earth" : "text-ink-soft"}`}>{tab}</button>
          ))}
        </div>

        <div className="p-5 space-y-5">
          <p className="text-[15px] leading-relaxed text-ink">An ancient temple built in the 12th century — one of the four major worship sites in the district, known for its Sahasranamam offerings.</p>

          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Opening" value="5:30 AM" sub="Morning darshan" />
            <InfoCard label="Closing" value="7:30 PM" sub="Evening" />
            <InfoCard label="Code" value={t.code} sub="TempleAddress ID" />
            <InfoCard label="Deity" value={t.deity} sub="Primary" />
          </div>

          {/* Sponsored ad in temple detail */}
          <SponsorCard ad={sponsorAds[0]} />

          {templeEvents.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-2">Upcoming Events</div>
              <div className="space-y-2">
                {templeEvents.map((e) => (
                  <div key={e.id} className="p-3 rounded-2xl bg-earth-soft/40 flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-earth grid place-items-center"><CalendarDays className="size-5 text-primary-foreground" /></div>
                    <div className="flex-1">
                      <div className="font-semibold text-ink text-sm">{e.title}</div>
                      <div className="text-xs text-earth">{e.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-2">Popular Poojas</div>
            <div className="space-y-2">
              {poojas.slice(0, 3).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-2xl bg-muted">
                  <div><div className="font-semibold text-ink text-sm">{p.name}</div><div className="font-ml text-xs text-ink-soft">{p.ml}</div></div>
                  <div className="font-serif font-semibold text-earth">₹{p.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 p-4 bg-card border-t border-border flex gap-3">
        <button className="size-14 rounded-2xl bg-earth-soft grid place-items-center"><MessageCircle className="size-6 text-earth" /></button>
        <button onClick={book} className="flex-1 h-14 rounded-2xl bg-earth text-primary-foreground font-bold text-base shadow-soft flex items-center justify-center gap-2"><Flame className="size-5" /> Book Pooja</button>
      </div>
    </div>
  );
}

function InfoCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="p-3 rounded-2xl bg-muted">
      <div className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">{label}</div>
      <div className="font-serif text-lg text-ink mt-0.5">{value}</div>
      <div className="text-xs text-ink-soft">{sub}</div>
    </div>
  );
}

/* ---------------- BOOKING ---------------- */
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

function BookSelect({ id, back, next }: { id: number; back: () => void; next: () => void }) {
  const t = temples.find((x) => x.id === id) ?? temples[0];
  const [selected, setSelected] = useState<string[]>(["p1"]);
  const toggle = (pid: string) => setSelected((s) => s.includes(pid) ? s.filter((x) => x !== pid) : [...s, pid]);
  const total = poojas.filter((p) => selected.includes(p.id)).reduce((a, b) => a + b.price, 0);
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <BookHeader back={back} title={t.name} sub="Select Poojas · Step 1 of 4" />
      <Stepper step={1} />
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {poojas.map((p) => {
          const on = selected.includes(p.id);
          return (
            <button key={p.id} onClick={() => toggle(p.id)} className={`w-full text-left p-4 rounded-2xl bg-card ring-2 transition ${on ? "ring-earth" : "ring-border"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><span className="font-semibold text-ink">{p.name}</span><span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-earth-soft text-earth uppercase">{p.cat}</span></div>
                  <div className="font-ml text-sm text-ink-soft mt-0.5">{p.ml}</div>
                  <div className="text-xs text-ink-soft mt-1.5">{p.desc}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-serif font-bold text-lg text-earth">₹{p.price}</div>
                  <div className={`mt-1 size-6 rounded-full grid place-items-center ml-auto ${on ? "bg-earth text-primary-foreground" : "bg-muted text-ink-soft"}`}>{on ? <Check className="size-4" /> : <Plus className="size-4" />}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="shrink-0 p-4 bg-card border-t border-border flex items-center gap-3">
        <div className="flex-1"><div className="text-xs text-ink-soft">{selected.length} pooja{selected.length !== 1 ? "s" : ""} selected</div><div className="text-xl font-bold text-ink">₹{total}</div></div>
        <button onClick={next} disabled={selected.length === 0} className="h-14 px-8 rounded-2xl bg-earth text-primary-foreground font-bold shadow-soft disabled:opacity-50 flex items-center gap-2">Continue <ChevronRight className="size-5" /></button>
      </div>
    </div>
  );
}

function BookDetails({ id, profile, back, next }: { id: number; profile: { name: string; phone: string }; back: () => void; next: () => void }) {
  const t = temples.find((x) => x.id === id) ?? temples[0];
  const [changePhone, setChangePhone] = useState(false);
  const [bookingPhone, setBookingPhone] = useState(profile.phone);
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <BookHeader back={back} title={t.name} sub="Devotee Details · Step 2 of 4" />
      <Stepper step={2} />
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <div className="p-3 rounded-2xl bg-verified/10 border border-verified/20 flex items-start gap-2">
          <ShieldCheck className="size-4 text-verified mt-0.5" />
          <div className="text-xs text-ink"><span className="font-semibold text-verified">{profile.name}</span> · +91 {profile.phone} — verified profile. No OTP needed for this booking.</div>
        </div>

        <Field label="Devotee Name / പേര്" required>
          <input defaultValue={profile.name} className="w-full h-14 px-4 rounded-2xl bg-card ring-1 ring-border font-semibold text-ink outline-none focus:ring-2 focus:ring-earth" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nakshatra / നക്ഷത്രം" required>
            <select className="w-full h-14 px-4 rounded-2xl bg-card ring-1 ring-border font-semibold text-ink outline-none"><option>Rohini (രോഹിണി)</option><option>Aswathi</option><option>Bharani</option></select>
          </Field>
          <Field label="Pooja Date" required>
            <input defaultValue="22/07/2026" className="w-full h-14 px-4 rounded-2xl bg-card ring-1 ring-border font-semibold text-ink outline-none" />
          </Field>
        </div>

        {/* Change booking phone — separate from profile */}
        <div className="p-3 rounded-2xl bg-muted">
          <button onClick={() => setChangePhone((s) => !s)} className="w-full flex items-center justify-between">
            <div className="text-left">
              <div className="text-sm font-semibold text-ink flex items-center gap-1.5"><Edit3 className="size-3.5" /> Booking contact number</div>
              <div className="text-xs text-ink-soft mt-0.5">{changePhone ? "Using a different number for this booking" : `Using verified: +91 ${profile.phone}`}</div>
            </div>
            <span className={`w-11 h-6 rounded-full p-0.5 transition ${changePhone ? "bg-earth" : "bg-border"}`}><span className={`block size-5 rounded-full bg-cream transition ${changePhone ? "translate-x-5" : ""}`} /></span>
          </button>
          {changePhone && (
            <div className="mt-3 flex gap-2">
              <div className="h-12 px-3 rounded-xl bg-card ring-1 ring-border font-semibold text-ink grid place-items-center text-sm">+91</div>
              <input value={bookingPhone} onChange={(e) => setBookingPhone(e.target.value)} className="flex-1 h-12 px-3 rounded-xl bg-card ring-1 ring-border font-semibold text-ink outline-none focus:ring-2 focus:ring-earth" />
            </div>
          )}
          <p className="text-[11px] text-ink-soft mt-2">This won't change your profile phone number.</p>
        </div>

        <Field label="Temple Donation (Optional)">
          <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-ink-soft">₹</span><input defaultValue="10" className="w-full h-14 pl-9 pr-4 rounded-2xl bg-card ring-1 ring-border font-semibold text-ink outline-none" /></div>
        </Field>
      </div>
      <div className="shrink-0 p-4 bg-card border-t border-border">
        <div className="flex items-center justify-between mb-3"><span className="text-ink-soft text-sm">Order Total</span><span className="text-xl font-bold text-ink">₹160.00</span></div>
        <button onClick={next} className="w-full h-14 rounded-2xl bg-earth text-primary-foreground font-bold shadow-soft flex items-center justify-center gap-2">Continue to Payment <ChevronRight className="size-5" /></button>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <div><label className="block text-sm font-semibold text-ink mb-2">{label} {required && <span className="text-earth">*</span>}</label>{children}</div>;
}

function BookPayment({ id, back, next }: { id: number; back: () => void; next: () => void }) {
  const t = temples.find((x) => x.id === id) ?? temples[0];
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <BookHeader back={back} title="Complete Payment" sub="Step 3 of 4" />
      <Stepper step={3} />
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div className="p-5 rounded-3xl bg-card ring-1 ring-border">
          <div className="text-center mb-4">
            <div className="mx-auto size-14 rounded-2xl bg-earth-soft grid place-items-center mb-2"><CreditCard className="size-6 text-earth" /></div>
            <div className="font-serif text-xl text-ink">Order Summary</div>
            <div className="text-xs text-ink-soft">Booking at {t.name}</div>
          </div>
          <div className="space-y-3 text-sm">
            <Row label="Pushpanjali" value="₹150.00" />
            <Row label="Donation" value="₹10.00" />
            <div className="border-t border-dashed border-border" />
            <Row label="Booking Total" value="₹160.00" bold />
            <Row label="Transaction Charges" value="₹2.36" muted />
            <div className="border-t border-border pt-3"><Row label="Total Payable" value="₹162.36" big /></div>
          </div>
        </div>
      </div>
      <div className="shrink-0 p-4 bg-card border-t border-border">
        <button onClick={next} className="w-full h-14 rounded-2xl bg-earth text-primary-foreground font-bold shadow-soft flex items-center justify-center gap-2">Pay ₹162.36</button>
        <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-ink-soft"><ShieldCheck className="size-3.5 text-verified" />Secured by <span className="font-bold text-[#3395FF]">Razorpay</span></div>
      </div>
    </div>
  );
}

function Row({ label, value, bold, muted, big }: { label: string; value: string; bold?: boolean; muted?: boolean; big?: boolean }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className={`${muted ? "text-ink-soft" : "text-ink"} ${bold ? "font-semibold" : ""}`}>{label}</span>
      <span className={`${muted ? "text-ink-soft" : "text-ink"} ${big ? "text-xl font-bold text-earth" : bold ? "font-semibold" : ""}`}>{value}</span>
    </div>
  );
}

function BookReceipt({ id, home }: { id: number; home: () => void }) {
  const t = temples.find((x) => x.id === id) ?? temples[0];
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-card">
      <div className="px-5 pt-5 pb-4 flex items-center justify-between shrink-0">
        <button onClick={home} className="text-sm text-ink-soft font-semibold">← Back to Home</button>
        <div className="flex gap-2">
          <button className="size-9 rounded-full bg-muted grid place-items-center"><Download className="size-4 text-ink" /></button>
          <button className="size-9 rounded-full bg-verified grid place-items-center"><Share2 className="size-4 text-white" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
        <div className="text-center py-4">
          <div className="mx-auto size-16 rounded-full bg-verified grid place-items-center mb-3 shadow-soft"><Check className="size-8 text-white" strokeWidth={3} /></div>
          <div className="font-serif text-2xl text-ink">Booking Confirmed</div>
          <div className="font-ml text-sm text-ink-soft mt-1">നിങ്ങളുടെ ബുക്കിംഗ് സ്ഥിരീകരിച്ചു</div>
        </div>
        <div className="rounded-3xl bg-cream ring-1 ring-border overflow-hidden">
          <div className="p-4 border-b border-dashed border-border"><div className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">Booking Receipt</div><div className="font-serif text-lg text-earth mt-1">{t.name}</div></div>
          <div className="p-4 space-y-2 text-sm">
            <Row label="Booking Code" value="TPB-1784382999-6138" />
            <Row label="Pooja Date" value="22/07/2026, 5:30 AM" />
            <Row label="Devotee" value="Anand · Rohini" />
          </div>
          <div className="p-4 bg-earth-soft/60 border-t border-dashed border-border"><Row label="Total Paid" value="₹162.36" big bold /></div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- BOOKINGS ---------------- */
function BookingsList({ open, goExplore }: { open: (id: number) => void; goExplore: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <header className="px-5 pt-3 pb-4 bg-card">
        <BrandRow />
        <h1 className="mt-3 text-2xl font-bold text-ink">My Bookings</h1>
        <div className="flex gap-2 mt-3"><Chip active>Upcoming</Chip><Chip>Past</Chip><Chip>Cancelled</Chip></div>
      </header>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {[temples[0], temples[2]].map((t, i) => (
          <button key={t.id} onClick={() => open(t.id)} className="w-full text-left rounded-3xl bg-card ring-1 ring-border p-4 flex gap-3">
            <img src={t.img} alt={t.name} className="size-20 rounded-2xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="font-serif text-base text-ink leading-tight truncate">{t.name}</div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${i === 0 ? "bg-verified/10 text-verified" : "bg-gold/15 text-earth"}`}>{i === 0 ? "Confirmed" : "Pending"}</span>
              </div>
              <div className="text-xs text-ink-soft mt-0.5">Pushpanjali · {i === 0 ? "22 Jul, 5:30 AM" : "25 Jul, 6:00 AM"}</div>
              <div className="mt-2 flex items-center justify-between"><span className="font-mono text-[10px] text-ink-soft">TPB-178438{i}999</span><span className="font-serif font-bold text-earth">₹{i === 0 ? "162" : "550"}</span></div>
            </div>
          </button>
        ))}
        <button onClick={goExplore} className="w-full mt-4 h-14 rounded-2xl border-2 border-dashed border-earth/40 text-earth font-semibold flex items-center justify-center gap-2"><Plus className="size-5" /> Book a new Pooja</button>
      </div>
    </div>
  );
}

/* Feed / status posts removed in this version — data submission lives in the Submit tab. */


/* ---------------- PROFILE ---------------- */
function ProfileScreen({ profile, openRefer, openAgent, openHub }: { profile: { name: string; phone: string }; openRefer: () => void; openAgent: () => void; openHub: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      <div className="bg-gradient-to-br from-earth to-earth/70 px-5 pt-6 pb-8 text-primary-foreground">
        <BrandRow right={<span className="text-[10px] font-bold px-2 py-1 rounded-full bg-cream/20 text-primary-foreground">VERIFIED</span>} />
        <div className="flex items-center gap-4 mt-4">
          <div className="size-16 rounded-full bg-cream text-earth grid place-items-center text-2xl font-bold ring-4 ring-cream/30">{profile.name[0]}</div>
          <div>
            <div className="text-lg font-bold">{profile.name}</div>
            <div className="text-sm text-primary-foreground/80 flex items-center gap-1"><ShieldCheck className="size-3.5" /> +91 {profile.phone}</div>
            <div className="font-ml text-xs text-primary-foreground/70 mt-0.5">രോഹിണി · Rohini</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-6">
          <Stat n="12" l="Bookings" /><Stat n="4" l="Temples" /><Stat n="₹2.4k" l="Donated" />
        </div>
      </div>

      <div className="p-4 space-y-3 bg-card flex-1">
        {/* Referral highlight */}
        <button onClick={openRefer} className="w-full p-4 rounded-2xl bg-gradient-to-r from-gold/25 to-earth/15 ring-1 ring-gold/30 flex items-center gap-3 text-left">
          <div className="size-12 rounded-xl bg-earth grid place-items-center"><Gift className="size-6 text-primary-foreground" /></div>
          <div className="flex-1">
            <div className="font-serif font-bold text-ink">Refer & Earn ₹100</div>
            <div className="text-xs text-ink-soft">Invite friends, earn on every pooja they book</div>
          </div>
          <ChevronRight className="size-5 text-earth" />
        </button>

        {/* Add a listing with Meenakshi */}
        <button onClick={openHub} className="w-full p-4 rounded-2xl bg-card ring-1 ring-border flex items-center gap-3 text-left">
          <img src={meenakshiImg} alt="Meenakshi" width={816} height={816} loading="lazy" className="size-12 rounded-xl object-cover object-top" />
          <div className="flex-1">
            <div className="font-semibold text-ink">Add a Listing with Meenakshi</div>
            <div className="text-xs text-ink-soft">Temple, service, event or local business</div>
          </div>
          <ChevronRight className="size-5 text-earth" />
        </button>

        {/* Agent dashboard */}
        <button onClick={openAgent} className="w-full p-4 rounded-2xl bg-card ring-1 ring-border flex items-center gap-3 text-left">
          <div className="size-12 rounded-xl bg-earth-soft grid place-items-center"><BarChart3 className="size-6 text-earth" /></div>
          <div className="flex-1">
            <div className="font-semibold text-ink">Agent Dashboard</div>
            <div className="text-xs text-ink-soft">Listings, wallet & commissions</div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-earth text-primary-foreground uppercase">Active</span>
        </button>

        <div className="pt-2 space-y-2">
          {[
            { i: CalendarDays, l: "My Bookings", s: "Upcoming and past poojas" },
            { i: Heart, l: "Saved Temples", s: "Your favorites" },
            { i: Bell, l: "Subscribed Temples", s: "2 temples · alerts on" },
            { i: Share2, l: "Share TempleAddress", s: "Send app to friends & family" },
            { i: MapPin, l: "Change Location", s: "Vaikom, Kottayam" },
            { i: User, l: "Language", s: "English · Malayalam" },
          ].map((it) => (
            <button key={it.l} className="w-full p-3 rounded-2xl bg-muted flex items-center gap-3">
              <div className="size-11 rounded-xl bg-earth-soft grid place-items-center"><it.i className="size-5 text-earth" /></div>
              <div className="flex-1 text-left"><div className="font-semibold text-ink text-sm">{it.l}</div><div className="text-xs text-ink-soft">{it.s}</div></div>
              <ChevronRight className="size-4 text-ink-soft" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return <div className="rounded-2xl bg-cream/15 backdrop-blur px-3 py-2.5 text-center"><div className="font-serif text-xl">{n}</div><div className="text-[10px] uppercase tracking-wider text-primary-foreground/80">{l}</div></div>;
}

/* ---------------- REFER & EARN ---------------- */
function ReferEarn({ back }: { back: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-card">
      <header className="px-5 pt-3 pb-4 flex items-center gap-3"><button onClick={back} className="size-10 rounded-full bg-muted grid place-items-center"><ArrowLeft className="size-5 text-ink" /></button><div className="text-lg font-bold text-ink">Refer & Earn</div></header>
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="rounded-3xl bg-gradient-to-br from-earth to-gold p-6 text-primary-foreground text-center">
          <Gift className="size-12 mx-auto mb-3" />
          <div className="font-serif text-2xl font-bold">Earn ₹100 per friend</div>
          <div className="text-sm mt-1 opacity-90">Your friend also gets ₹50 off their first pooja</div>
        </div>
        <div className="mt-5">
          <div className="text-xs font-semibold text-ink-soft uppercase tracking-wider mb-2">Your referral code</div>
          <div className="p-4 rounded-2xl bg-earth-soft flex items-center justify-between">
            <div className="font-serif text-2xl font-bold text-earth tracking-widest">ANAND100</div>
            <button className="h-10 px-4 rounded-full bg-earth text-primary-foreground text-sm font-bold">Copy</button>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-4 gap-3">
          {[
            { i: MessageCircle, l: "WhatsApp" },
            { i: Share2, l: "Share" },
            { i: FileText, l: "SMS" },
            { i: Users, l: "Contacts" },
          ].map((x) => (
            <button key={x.l} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-muted"><div className="size-11 rounded-full bg-earth grid place-items-center"><x.i className="size-5 text-primary-foreground" /></div><span className="text-[11px] font-semibold text-ink">{x.l}</span></button>
          ))}
        </div>
        <div className="mt-6 p-4 rounded-2xl bg-muted">
          <div className="text-sm font-semibold text-ink mb-3">Your earnings</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><div className="font-serif text-2xl font-bold text-earth">7</div><div className="text-[10px] uppercase text-ink-soft">Invited</div></div>
            <div><div className="font-serif text-2xl font-bold text-earth">5</div><div className="text-[10px] uppercase text-ink-soft">Joined</div></div>
            <div><div className="font-serif text-2xl font-bold text-verified">₹500</div><div className="text-[10px] uppercase text-ink-soft">Earned</div></div>
          </div>
        </div>
        <div className="mt-4 p-4 rounded-2xl bg-earth-soft/50">
          <div className="text-sm font-semibold text-ink flex items-center gap-2"><Wallet className="size-4 text-earth" /> Affiliate program</div>
          <div className="text-xs text-ink-soft mt-1">Become a TempleAddress affiliate — earn commission on every booking your network makes. Apply from Agent Dashboard.</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- AGENT DASHBOARD ---------------- */
function AgentDashboard({ back, openHub, openListings }: { back: () => void; openHub: () => void; openListings: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <header className="px-5 pt-3 pb-4 bg-card flex items-center gap-3"><button onClick={back} className="size-10 rounded-full bg-muted grid place-items-center"><ArrowLeft className="size-5 text-ink" /></button><div><div className="text-lg font-bold text-ink">Agent Hub</div><div className="text-xs text-ink-soft">Anand Nambissan · Active</div></div></header>
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="mx-5 mt-2 rounded-3xl bg-gradient-to-br from-earth to-earth/70 p-5 text-primary-foreground">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider opacity-90"><Sparkles className="size-3" /> TempleAddress Agent</div>
          <div className="mt-2 text-2xl font-serif font-bold">Track earnings & listings</div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="rounded-2xl bg-cream/15 p-3"><div className="text-[10px] uppercase opacity-80">Commission</div><div className="font-serif text-lg font-bold">₹647.27</div></div>
            <div className="rounded-2xl bg-cream/15 p-3"><div className="text-[10px] uppercase opacity-80">Wallet</div><div className="font-serif text-lg font-bold">₹647.27</div></div>
            <div className="rounded-2xl bg-cream/15 p-3"><div className="text-[10px] uppercase opacity-80">Payout</div><div className="font-serif text-lg font-bold">₹0.00</div></div>
          </div>
        </div>

        <div className="px-5 mt-5">
          <div className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-3">Quick Actions</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { i: Flame, l: "Temples", n: 11, a: openListings },
              { i: CalendarDays, l: "Festivals", n: 4, a: openListings },
              { i: Users, l: "Services", n: 6, a: openListings },
              { i: Sparkles, l: "Holy Places", n: 2, a: openListings },
              { i: Plus, l: "Add Listing", a: openHub },
              { i: Megaphone, l: "Ads & Sponsors", a: openHub },
            ].map((x) => (
              <button key={x.l} onClick={x.a} className="p-3 rounded-2xl bg-card ring-1 ring-border flex flex-col items-start gap-2 text-left">
                <div className="size-9 rounded-xl bg-earth-soft grid place-items-center"><x.i className="size-4 text-earth" /></div>
                <div><div className="text-xs font-semibold text-ink">{x.l}</div>{x.n !== undefined && <div className="text-[10px] text-ink-soft">{x.n} active</div>}</div>
              </button>
            ))}

          </div>
        </div>

        <div className="px-5 mt-5">
          <div className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-3">Recent Commissions</div>
          <div className="space-y-2">
            {[
              { d: "10 Jul, 7:55 PM", a: "0.04", t: "Perayattil Ambalakkandy Subrahmanya" },
              { d: "23 Jun, 9:07 AM", a: "0.10", t: "Perayattil Ambalakkandy Subrahmanya" },
              { d: "11 Jun, 7:26 PM", a: "0.10", t: "Kottur Sri Mahavishnu" },
            ].map((r, i) => (
              <div key={i} className="p-3 rounded-2xl bg-card ring-1 ring-border flex items-center gap-3">
                <div className="size-10 rounded-xl bg-verified/10 grid place-items-center"><Wallet className="size-5 text-verified" /></div>
                <div className="flex-1 min-w-0"><div className="text-sm font-semibold text-ink truncate">{r.t}</div><div className="text-[11px] text-ink-soft">{r.d}</div></div>
                <div className="font-serif font-bold text-verified">+₹{r.a}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-5 mt-5 p-4 rounded-2xl bg-earth-soft/50 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-earth grid place-items-center"><Wallet className="size-5 text-primary-foreground" /></div>
          <div className="flex-1"><div className="font-semibold text-ink text-sm">Withdraw to bank</div><div className="text-xs text-ink-soft">Minimum ₹100 · UPI / IMPS</div></div>
          <button className="h-9 px-4 rounded-full bg-earth text-primary-foreground text-xs font-bold">Payout</button>
        </div>
      </div>
    </div>
  );
}
