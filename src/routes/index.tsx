import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  MessageCircle, Compass, CalendarCheck, Circle, User,
  Search, Phone, Video, MoreVertical, ArrowLeft, Plus, Mic, Smile,
  MapPin, Star, ShieldCheck, ChevronRight, Check, CheckCheck,
  Flame, Sparkles, Heart, CalendarDays, CreditCard, Share2, Download,
} from "lucide-react";
import temple1 from "@/assets/temple-1.jpg";
import temple2 from "@/assets/temple-2.jpg";
import temple3 from "@/assets/temple-3.jpg";
import temple4 from "@/assets/temple-4.jpg";

export const Route = createFileRoute("/")({
  component: App,
});

type Tab = "chats" | "explore" | "bookings" | "status" | "profile";
type View =
  | { name: "tab" }
  | { name: "chat"; id: string }
  | { name: "temple"; id: number }
  | { name: "book-select"; id: number }
  | { name: "book-details"; id: number }
  | { name: "book-payment"; id: number }
  | { name: "book-receipt"; id: number };

const temples = [
  { id: 1, name: "Vaikom Mahadeva Temple", ml: "വൈക്കം മഹാദേവ ക്ഷേത്രം", loc: "Vaikom, Kottayam", dist: "2.4 km", img: temple1, verified: true, pooja: true, deity: "Shiva", code: "T1028" },
  { id: 2, name: "Guruvayur Sree Krishna", ml: "ഗുരുവായൂർ ശ്രീ കൃഷ്ണ ക്ഷേത്രം", loc: "Thrissur, Kerala", dist: "18 km", img: temple3, verified: true, pooja: true, deity: "Krishna", code: "T1104" },
  { id: 3, name: "Kottur Sri Mahavishnu", ml: "കോട്ടൂർ ശ്രീ മഹാവിഷ്ണു ക്ഷേത്രം", loc: "Kozhikode", dist: "42 km", img: temple2, verified: true, pooja: true, deity: "Vishnu", code: "T1091" },
  { id: 4, name: "Ambalappuzha Sree Krishna", ml: "അമ്പലപ്പുഴ ശ്രീ കൃഷ്ണ ക്ഷേത്രം", loc: "Alappuzha", dist: "55 km", img: temple4, verified: false, pooja: true, deity: "Krishna", code: "T1223" },
];

const poojas = [
  { id: "p1", name: "Pushpanjali", ml: "പുഷ്പാഞ്ജലി", desc: "Offering of flowers for prosperity", price: 150, cat: "Daily" },
  { id: "p2", name: "Neyvilakku", ml: "നെയ്‌വിളക്ക്", desc: "Ghee lamp offering", price: 100, cat: "Daily" },
  { id: "p3", name: "Ganapathi Homam", ml: "ഗണപതി ഹോമം", desc: "Special ritual to remove obstacles", price: 501, cat: "Special" },
  { id: "p4", name: "Sahasranamam", ml: "സഹസ്രനാമം", desc: "Chanting of 1000 names", price: 250, cat: "Daily" },
];

const chats = [
  { id: "c1", name: "Vaikom Mahadeva Temple", ml: "വൈക്കം മഹാദേവ", last: "🙏 Pradosha Pooja tomorrow at 5:30 PM. All devotees welcome.", time: "10:45", unread: 2, group: true, avatar: temple1 },
  { id: "c2", name: "Kottur Sree Mahavishnu", last: "Your booking TPB-1784...6138 is confirmed.", time: "2:14 PM", unread: 1, group: false, avatar: temple2, official: true },
  { id: "c3", name: "Ramesh Pandit Ji", ml: "രമേശ്", last: "Namaskaram. I will reach by 5 PM for the pooja.", time: "Yesterday", unread: 0, group: false, avatar: null, initials: "RP" },
  { id: "c4", name: "Guruvayur Devotees", last: "Anitha: Ekadashi celebrations photos 📷", time: "Yesterday", unread: 5, group: true, avatar: temple3 },
  { id: "c5", name: "Ravi (Electrician)", last: "Light repair done ✓", time: "Mon", unread: 0, group: false, avatar: null, initials: "RV", service: true },
  { id: "c6", name: "Anand Nambissan", last: "Voice message (0:23)", time: "Sun", unread: 0, group: false, avatar: null, initials: "AN" },
];

const statuses = [
  { id: "s1", name: "Vaikom Temple", ml: "വൈക്കം", time: "1h ago", avatar: temple1 },
  { id: "s2", name: "Guruvayur Devotees", time: "3h ago", avatar: temple3 },
  { id: "s3", name: "Ramesh Pandit Ji", time: "5h ago", avatar: null, initials: "RP" },
];

function App() {
  const [tab, setTab] = useState<Tab>("explore");
  const [view, setView] = useState<View>({ name: "tab" });

  return (
    <div className="min-h-screen w-full bg-[oklch(0.88_0.02_60)] flex items-center justify-center md:p-8">
      {/* Mobile Frame */}
      <div className="relative w-full max-w-[420px] h-[100dvh] md:h-[860px] md:rounded-[44px] bg-cream overflow-hidden md:shadow-frame md:ring-1 md:ring-black/5 flex flex-col">
        {/* Status bar spacer */}
        <div className="h-6 md:h-8 shrink-0 bg-transparent" />

        <div className="flex-1 min-h-0 flex flex-col">
          {view.name === "tab" && <TabView tab={tab} setView={setView} setTab={setTab} />}
          {view.name === "chat" && <ChatDetail chatId={view.id} back={() => setView({ name: "tab" })} />}
          {view.name === "temple" && <TempleDetail id={view.id} back={() => setView({ name: "tab" })} book={() => setView({ name: "book-select", id: view.id })} />}
          {view.name === "book-select" && <BookSelect id={view.id} back={() => setView({ name: "temple", id: view.id })} next={() => setView({ name: "book-details", id: view.id })} />}
          {view.name === "book-details" && <BookDetails id={view.id} back={() => setView({ name: "book-select", id: view.id })} next={() => setView({ name: "book-payment", id: view.id })} />}
          {view.name === "book-payment" && <BookPayment id={view.id} back={() => setView({ name: "book-details", id: view.id })} next={() => setView({ name: "book-receipt", id: view.id })} />}
          {view.name === "book-receipt" && <BookReceipt id={view.id} home={() => { setView({ name: "tab" }); setTab("bookings"); }} />}
        </div>

        {/* Bottom Nav — only on tab views */}
        {view.name === "tab" && <BottomNav tab={tab} setTab={setTab} />}
      </div>
    </div>
  );
}

/* ---------------- Bottom Nav ---------------- */
function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items: { id: Tab; label: string; icon: typeof MessageCircle; badge?: number }[] = [
    { id: "chats", label: "Chats", icon: MessageCircle, badge: 8 },
    { id: "explore", label: "Explore", icon: Compass },
    { id: "bookings", label: "Bookings", icon: CalendarCheck },
    { id: "status", label: "Status", icon: Circle },
    { id: "profile", label: "Profile", icon: User },
  ];
  return (
    <nav className="shrink-0 bg-card border-t border-border pb-safe">
      <div className="flex justify-around items-center h-20 px-2">
        {items.map((it) => {
          const active = tab === it.id;
          const Icon = it.icon;
          return (
            <button
              key={it.id}
              onClick={() => setTab(it.id)}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full active:scale-95 transition"
            >
              <div className="relative">
                <Icon className={`size-6 ${active ? "text-earth" : "text-ink-soft"}`} strokeWidth={active ? 2.4 : 2} />
                {it.badge ? (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-earth text-primary-foreground text-[10px] font-bold grid place-items-center">{it.badge}</span>
                ) : null}
              </div>
              <span className={`text-[10px] font-semibold tracking-wide ${active ? "text-earth" : "text-ink-soft"}`}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ---------------- Tab Router ---------------- */
function TabView({ tab, setView, setTab }: { tab: Tab; setView: (v: View) => void; setTab: (t: Tab) => void }) {
  if (tab === "chats") return <ChatsList open={(id) => setView({ name: "chat", id })} />;
  if (tab === "explore") return <ExploreTemples open={(id) => setView({ name: "temple", id })} />;
  if (tab === "bookings") return <BookingsList open={(id) => setView({ name: "temple", id })} goExplore={() => setTab("explore")} />;
  if (tab === "status") return <StatusScreen />;
  return <ProfileScreen />;
}

/* ---------------- CHATS LIST ---------------- */
function ChatsList({ open }: { open: (id: string) => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <header className="px-5 pt-3 pb-4 bg-card">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink">Chats</h1>
          <div className="flex gap-2">
            <button className="size-10 rounded-full bg-muted grid place-items-center"><Search className="size-5 text-ink-soft" /></button>
            <button className="size-10 rounded-full bg-earth-soft grid place-items-center"><Plus className="size-5 text-earth" /></button>
          </div>
        </div>
        {/* Filter chips */}
        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
          <Chip active>All</Chip>
          <Chip>Temples</Chip>
          <Chip>Groups</Chip>
          <Chip>Services</Chip>
          <Chip>Unread</Chip>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-card">
        {chats.map((c, i) => (
          <button
            key={c.id}
            onClick={() => open(c.id)}
            className={`w-full px-5 py-4 flex gap-4 items-center active:bg-muted ${i !== chats.length - 1 ? "border-b border-border/50" : ""}`}
          >
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
  return (
    <span className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold ${active ? "bg-earth text-primary-foreground" : "bg-muted text-ink-soft"}`}>
      {children}
    </span>
  );
}

function Avatar({ name, img, initials, size = 48 }: { name: string; img?: string | null; initials?: string; size?: number }) {
  const style = { width: size, height: size };
  if (img) return <img src={img} alt={name} style={style} className="rounded-full object-cover ring-1 ring-black/5 shrink-0" loading="lazy" />;
  const label = initials ?? name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <div style={style} className="rounded-full bg-gradient-to-br from-earth-soft to-earth/30 grid place-items-center font-bold text-earth shrink-0">
      {label}
    </div>
  );
}

/* ---------------- CHAT DETAIL (WhatsApp-style) ---------------- */
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
          <div className="font-semibold text-ink truncate flex items-center gap-1.5">
            {chat.name}
            {chat.official && <ShieldCheck className="size-4 text-verified" />}
          </div>
          <div className="text-xs text-verified">online</div>
        </div>
        <button className="size-10 grid place-items-center"><Video className="size-5 text-ink-soft" /></button>
        <button className="size-10 grid place-items-center"><Phone className="size-5 text-ink-soft" /></button>
        <button className="size-10 grid place-items-center"><MoreVertical className="size-5 text-ink-soft" /></button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2" style={{ backgroundImage: "radial-gradient(oklch(0.9 0.02 60) 1px, transparent 1px)", backgroundSize: "18px 18px" }}>
        <div className="text-center my-3">
          <span className="text-[11px] bg-cream/80 text-ink-soft px-3 py-1 rounded-full font-medium">Today</span>
        </div>
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-3.5 py-2 rounded-2xl shadow-sm ${m.from === "me" ? "bg-chat-out text-ink rounded-br-md" : "bg-chat-in text-ink rounded-bl-md"}`}>
              <p className="text-[15px] leading-snug">{m.text}</p>
              <div className={`flex items-center gap-1 justify-end mt-0.5 ${m.from === "me" ? "text-ink-soft" : "text-ink-soft"}`}>
                <span className="text-[10px]">{m.time}</span>
                {m.from === "me" && <CheckCheck className="size-3 text-verified" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-2 bg-transparent shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-card rounded-full px-4 py-2.5 shadow-sm">
            <Smile className="size-5 text-ink-soft" />
            <input placeholder="Message" className="flex-1 bg-transparent outline-none text-[15px]" />
            <Plus className="size-5 text-ink-soft" />
          </div>
          <button className="size-12 rounded-full bg-earth grid place-items-center shadow-soft">
            <Mic className="size-5 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- EXPLORE TEMPLES ---------------- */
function ExploreTemples({ open }: { open: (id: number) => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <header className="px-5 pt-3 pb-4 bg-card">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-earth grid place-items-center shadow-soft">
            <Flame className="size-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-ink-soft font-medium">Namaskaram 🙏</div>
            <div className="text-base font-bold text-ink">Find Divine Grace</div>
          </div>
          <button className="size-10 rounded-full bg-muted grid place-items-center"><MapPin className="size-5 text-earth" /></button>
        </div>

        <div className="mt-4 relative">
          <Search className="size-5 text-ink-soft absolute left-4 top-1/2 -translate-y-1/2" />
          <input placeholder="Search temples, poojas, cities..." className="w-full h-13 pl-12 pr-4 py-3.5 rounded-2xl bg-muted text-[15px] outline-none placeholder:text-ink-soft" />
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
          <Chip active>All Temples</Chip>
          <Chip>Verified</Chip>
          <Chip>Pooja Open</Chip>
          <Chip>Near Me</Chip>
          <Chip>Kerala</Chip>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-6 space-y-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-xl text-ink">Popular near you</h2>
          <span className="text-xs text-ink-soft">40 results</span>
        </div>

        {temples.map((t) => (
          <button key={t.id} onClick={() => open(t.id)} className="w-full bg-card rounded-3xl overflow-hidden shadow-soft ring-1 ring-black/5 active:scale-[0.99] transition text-left">
            <div className="relative">
              <img src={t.img} alt={t.name} width={800} height={600} loading="lazy" className="w-full aspect-[16/10] object-cover" />
              <div className="absolute top-3 left-3 flex gap-1.5">
                {t.verified && (
                  <span className="px-2 py-1 rounded-md bg-cream/95 text-verified text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="size-3" /> Verified
                  </span>
                )}
                {t.pooja && (
                  <span className="px-2 py-1 rounded-md bg-earth text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                    Pooja Open
                  </span>
                )}
              </div>
              <button className="absolute top-3 right-3 size-9 rounded-full bg-cream/90 grid place-items-center backdrop-blur">
                <Heart className="size-4 text-earth" />
              </button>
            </div>
            <div className="p-4">
              <h3 className="font-serif text-lg text-ink leading-tight">{t.name}</h3>
              <div className="font-ml text-sm text-ink-soft mt-0.5">{t.ml}</div>
              <div className="mt-3 flex items-center gap-4 text-sm text-ink-soft">
                <span className="flex items-center gap-1"><MapPin className="size-4" />{t.loc}</span>
                <span>·</span>
                <span>{t.dist}</span>
              </div>
              <div className="mt-3 flex items-center gap-1">
                <Star className="size-4 fill-gold text-gold" />
                <Star className="size-4 fill-gold text-gold" />
                <Star className="size-4 fill-gold text-gold" />
                <Star className="size-4 fill-gold text-gold" />
                <Star className="size-4 fill-gold text-gold" />
                <span className="text-xs text-ink-soft ml-1">4.9 · Code {t.code}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- TEMPLE DETAIL ---------------- */
function TempleDetail({ id, back, book }: { id: number; back: () => void; book: () => void }) {
  const t = temples.find((x) => x.id === id) ?? temples[0];
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="relative shrink-0">
        <img src={t.img} alt={t.name} className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
        <button onClick={back} className="absolute top-3 left-3 size-10 rounded-full bg-cream/95 grid place-items-center backdrop-blur">
          <ArrowLeft className="size-5 text-ink" />
        </button>
        <div className="absolute top-3 right-3 flex gap-2">
          <button className="size-10 rounded-full bg-cream/95 grid place-items-center"><Share2 className="size-4 text-ink" /></button>
          <button className="size-10 rounded-full bg-cream/95 grid place-items-center"><Heart className="size-4 text-earth" /></button>
        </div>
        <div className="absolute bottom-4 left-5 right-5 text-white">
          <div className="flex gap-1.5 mb-2">
            {t.verified && <span className="px-2 py-0.5 rounded bg-verified text-white text-[10px] font-bold uppercase">Verified</span>}
            <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur text-white text-[10px] font-bold uppercase">Hindu Temple</span>
          </div>
          <h1 className="font-serif text-2xl leading-tight">{t.name}</h1>
          <p className="font-ml text-sm text-white/90 mt-0.5">{t.ml}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-card">
        <div className="flex border-b border-border sticky top-0 bg-card z-10">
          {["Basic Info", "Poojas", "Gallery", "Contact"].map((tab, i) => (
            <button key={tab} className={`flex-1 py-3.5 text-sm font-semibold ${i === 0 ? "text-earth border-b-2 border-earth" : "text-ink-soft"}`}>{tab}</button>
          ))}
        </div>

        <div className="p-5 space-y-5">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-1.5">About</div>
            <p className="text-[15px] leading-relaxed text-ink">
              An ancient temple built in the 12th century by the eight illams of the region. It is one of the four major worship sites in the district and known for its Sahasranamam offerings.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Opening" value="5:30 AM" sub="Morning darshan" />
            <InfoCard label="Closing" value="7:30 PM" sub="Evening" />
            <InfoCard label="Temple Code" value={t.code} sub="TempleAddress ID" />
            <InfoCard label="Deity" value={t.deity} sub="Primary" />
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-2">Location</div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted">
              <div className="size-10 rounded-xl bg-earth grid place-items-center"><MapPin className="size-5 text-primary-foreground" /></div>
              <div className="flex-1">
                <div className="font-semibold text-ink text-sm">{t.loc}</div>
                <div className="text-xs text-ink-soft">{t.dist} from you</div>
              </div>
              <ChevronRight className="size-4 text-ink-soft" />
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink-soft mb-2">Popular Poojas</div>
            <div className="space-y-2">
              {poojas.slice(0, 3).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-2xl bg-muted">
                  <div>
                    <div className="font-semibold text-ink text-sm">{p.name}</div>
                    <div className="font-ml text-xs text-ink-soft">{p.ml}</div>
                  </div>
                  <div className="font-serif font-semibold text-earth">₹{p.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 p-4 bg-card border-t border-border flex gap-3">
        <button className="size-14 rounded-2xl bg-earth-soft grid place-items-center">
          <MessageCircle className="size-6 text-earth" />
        </button>
        <button onClick={book} className="flex-1 h-14 rounded-2xl bg-earth text-primary-foreground font-bold text-base shadow-soft flex items-center justify-center gap-2 active:scale-[0.98]">
          <Flame className="size-5" /> Book Pooja
        </button>
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

/* ---------------- BOOKING FLOW ---------------- */
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
        <div className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">Available Poojas</div>
        {poojas.map((p) => {
          const on = selected.includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              className={`w-full text-left p-4 rounded-2xl bg-card ring-2 transition ${on ? "ring-earth" : "ring-border"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink">{p.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-earth-soft text-earth uppercase">{p.cat}</span>
                  </div>
                  <div className="font-ml text-sm text-ink-soft mt-0.5">{p.ml}</div>
                  <div className="text-xs text-ink-soft mt-1.5">{p.desc}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-serif font-bold text-lg text-earth">₹{p.price}</div>
                  <div className={`mt-1 size-6 rounded-full grid place-items-center ml-auto ${on ? "bg-earth text-primary-foreground" : "bg-muted text-ink-soft"}`}>
                    {on ? <Check className="size-4" /> : <Plus className="size-4" />}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="shrink-0 p-4 bg-card border-t border-border flex items-center gap-3">
        <div className="flex-1">
          <div className="text-xs text-ink-soft">{selected.length} pooja{selected.length !== 1 ? "s" : ""} selected</div>
          <div className="text-xl font-bold text-ink">₹{total}</div>
        </div>
        <button onClick={next} disabled={selected.length === 0} className="h-14 px-8 rounded-2xl bg-earth text-primary-foreground font-bold shadow-soft disabled:opacity-50 flex items-center gap-2">
          Continue <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}

function BookDetails({ id, back, next }: { id: number; back: () => void; next: () => void }) {
  const t = temples.find((x) => x.id === id) ?? temples[0];
  const [date, setDate] = useState("22/07/2026");
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <BookHeader back={back} title={t.name} sub="Devotee Details · Step 2 of 4" />
      <Stepper step={2} />
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <Field label="Devotee Name / പേര്" required>
          <input defaultValue="Anand Nambissan" className="w-full h-14 px-4 rounded-2xl bg-card ring-1 ring-border font-semibold text-ink outline-none focus:ring-2 focus:ring-earth" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nakshatra / നക്ഷത്രം" required>
            <select className="w-full h-14 px-4 rounded-2xl bg-card ring-1 ring-border font-semibold text-ink outline-none">
              <option>Rohini (രോഹിണി)</option>
              <option>Aswathi</option>
              <option>Bharani</option>
            </select>
          </Field>
          <Field label="Pooja Date" required>
            <input value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-14 px-4 rounded-2xl bg-card ring-1 ring-border font-semibold text-ink outline-none" />
          </Field>
        </div>
        <Field label="Mobile Number / മൊബൈൽ" required>
          <div className="flex gap-2">
            <div className="h-14 px-4 rounded-2xl bg-card ring-1 ring-border font-semibold text-ink grid place-items-center">+91</div>
            <input defaultValue="94966 86256" className="flex-1 h-14 px-4 rounded-2xl bg-card ring-1 ring-border font-semibold text-ink outline-none" />
          </div>
          <p className="text-xs text-ink-soft mt-1.5">OTP will be sent to verify your mobile.</p>
        </Field>
        <Field label="Prasad Collection">
          <select className="w-full h-14 px-4 rounded-2xl bg-card ring-1 ring-border font-semibold text-ink outline-none">
            <option>Collect at Counter</option>
            <option>Home Delivery (+₹50)</option>
          </select>
        </Field>
        <Field label="Temple Donation (Optional)">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-ink-soft">₹</span>
            <input defaultValue="10" className="w-full h-14 pl-9 pr-4 rounded-2xl bg-card ring-1 ring-border font-semibold text-ink outline-none" />
          </div>
        </Field>
      </div>
      <div className="shrink-0 p-4 bg-card border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-ink-soft text-sm">Order Total</span>
          <span className="text-xl font-bold text-ink">₹160.00</span>
        </div>
        <button onClick={next} className="w-full h-14 rounded-2xl bg-earth text-primary-foreground font-bold shadow-soft flex items-center justify-center gap-2">
          Continue to Verify <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-ink mb-2">
        {label} {required && <span className="text-earth">*</span>}
      </label>
      {children}
    </div>
  );
}

function BookPayment({ id, back, next }: { id: number; back: () => void; next: () => void }) {
  const t = temples.find((x) => x.id === id) ?? temples[0];
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <BookHeader back={back} title="Complete Payment" sub="Step 4 of 4" />
      <Stepper step={4} />
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div className="p-3 rounded-2xl bg-verified/10 border border-verified/20 flex items-center gap-2">
          <Check className="size-4 text-verified" />
          <span className="text-sm text-verified font-semibold">OTP verified. Continue to payment.</span>
        </div>

        <div className="p-5 rounded-3xl bg-card ring-1 ring-border">
          <div className="text-center mb-4">
            <div className="mx-auto size-14 rounded-2xl bg-earth-soft grid place-items-center mb-2">
              <CreditCard className="size-6 text-earth" />
            </div>
            <div className="font-serif text-xl text-ink">Order Summary</div>
            <div className="text-xs text-ink-soft">Booking at {t.name}</div>
          </div>

          <div className="space-y-3 text-sm">
            <Row label="Pushpanjali (Anand)" value="₹150.00" />
            <Row label="Donation" value="₹10.00" />
            <div className="border-t border-dashed border-border" />
            <Row label="Booking Total" value="₹160.00" bold />
            <Row label="Transaction Charges & Taxes" value="₹2.36" muted />
            <div className="border-t border-border pt-3">
              <Row label="Total Payable" value="₹162.36" big />
            </div>
          </div>

          <div className="mt-4 p-3 rounded-2xl bg-muted text-xs text-ink-soft space-y-1">
            <div className="flex justify-between"><span>Booking Code</span><span className="font-mono text-ink">TPB-1784382999-6138</span></div>
            <div className="flex justify-between"><span>Mobile</span><span className="text-ink">+91 94966 86256</span></div>
            <div className="flex justify-between"><span>Temple</span><span className="text-ink truncate max-w-[60%]">{t.name}</span></div>
          </div>
        </div>
      </div>

      <div className="shrink-0 p-4 bg-card border-t border-border">
        <button onClick={next} className="w-full h-14 rounded-2xl bg-earth text-primary-foreground font-bold shadow-soft flex items-center justify-center gap-2">
          Pay ₹162.36
        </button>
        <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-ink-soft">
          <ShieldCheck className="size-3.5 text-verified" />
          Secured by <span className="font-bold text-[#3395FF]">Razorpay</span>
        </div>
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
          <div className="mx-auto size-16 rounded-full bg-verified grid place-items-center mb-3 shadow-soft">
            <Check className="size-8 text-white" strokeWidth={3} />
          </div>
          <div className="font-serif text-2xl text-ink">Booking Confirmed</div>
          <div className="font-ml text-sm text-ink-soft mt-1">നിങ്ങളുടെ ബുക്കിംഗ് സ്ഥിരീകരിച്ചു</div>
          <span className="inline-block mt-3 px-3 py-1 rounded-full bg-verified/10 text-verified text-[11px] font-bold uppercase tracking-wider">Confirmed</span>
        </div>

        <div className="rounded-3xl bg-cream ring-1 ring-border overflow-hidden">
          <div className="p-4 border-b border-dashed border-border">
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink-soft">Booking Receipt</div>
            <div className="font-serif text-lg text-earth mt-1">{t.name}</div>
          </div>
          <div className="p-4 space-y-2 text-sm">
            <Row label="Booking Code" value="TPB-1784382999-6138" />
            <Row label="Date" value="18/07/2026, 19:26" />
            <Row label="Devotee" value="Anand" />
            <Row label="Mobile" value="+91 94966 86256" />
            <Row label="Star" value="Rohini" />
            <Row label="Pooja Date" value="22/07/2026, 5:30 AM" />
            <Row label="Delivery" value="Counter" />
          </div>
          <div className="p-4 bg-earth-soft/60 border-t border-dashed border-border">
            <Row label="Total Paid" value="₹162.36" big bold />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-earth-soft/50 flex items-start gap-3">
          <div className="size-10 rounded-xl bg-earth grid place-items-center shrink-0">
            <MessageCircle className="size-5 text-primary-foreground" />
          </div>
          <div className="text-sm text-ink">
            <div className="font-semibold">Message from Temple</div>
            <div className="text-ink-soft mt-0.5">Please arrive 15 minutes early. Collect prasad token at the counter. 🙏</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- BOOKINGS LIST ---------------- */
function BookingsList({ open, goExplore }: { open: (id: number) => void; goExplore: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <header className="px-5 pt-3 pb-4 bg-card">
        <h1 className="text-2xl font-bold text-ink">My Bookings</h1>
        <div className="flex gap-2 mt-4">
          <Chip active>Upcoming</Chip>
          <Chip>Past</Chip>
          <Chip>Cancelled</Chip>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {[temples[0], temples[2]].map((t, i) => (
          <button key={t.id} onClick={() => open(t.id)} className="w-full text-left rounded-3xl bg-card ring-1 ring-border p-4 flex gap-3 active:scale-[0.99] transition">
            <img src={t.img} alt={t.name} className="size-20 rounded-2xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="font-serif text-base text-ink leading-tight truncate">{t.name}</div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${i === 0 ? "bg-verified/10 text-verified" : "bg-gold/15 text-earth"}`}>{i === 0 ? "Confirmed" : "Pending"}</span>
              </div>
              <div className="text-xs text-ink-soft mt-0.5">Pushpanjali · {i === 0 ? "22 Jul, 5:30 AM" : "25 Jul, 6:00 AM"}</div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-[10px] text-ink-soft">TPB-178438{i}999</span>
                <span className="font-serif font-bold text-earth">₹{i === 0 ? "162" : "550"}</span>
              </div>
            </div>
          </button>
        ))}

        <button onClick={goExplore} className="w-full mt-4 h-14 rounded-2xl border-2 border-dashed border-earth/40 text-earth font-semibold flex items-center justify-center gap-2">
          <Plus className="size-5" /> Book a new Pooja
        </button>
      </div>
    </div>
  );
}

/* ---------------- STATUS ---------------- */
function StatusScreen() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <header className="px-5 pt-3 pb-4 bg-card">
        <h1 className="text-2xl font-bold text-ink">Status</h1>
        <p className="text-xs text-ink-soft mt-1">Share temple moments with your community</p>
      </header>
      <div className="flex-1 overflow-y-auto bg-card">
        <div className="px-5 py-4 flex gap-4 items-center border-b border-border">
          <div className="relative">
            <div className="size-14 rounded-full bg-muted grid place-items-center font-bold text-ink-soft">AN</div>
            <div className="absolute -bottom-0.5 -right-0.5 size-6 rounded-full bg-earth grid place-items-center ring-2 ring-card">
              <Plus className="size-3.5 text-primary-foreground" />
            </div>
          </div>
          <div>
            <div className="font-semibold text-ink">My Status</div>
            <div className="text-xs text-ink-soft">Tap to add status update</div>
          </div>
        </div>

        <div className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-soft">Recent Updates</div>
        {statuses.map((s) => (
          <div key={s.id} className="px-5 py-3 flex items-center gap-4 border-b border-border/50">
            <div className="size-14 rounded-full p-0.5 ring-2 ring-earth">
              <Avatar name={s.name} img={s.avatar} initials={s.initials} size={52} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-ink">{s.name}</div>
              {s.ml && <div className="font-ml text-xs text-ink-soft">{s.ml}</div>}
              <div className="text-xs text-ink-soft">{s.time}</div>
            </div>
          </div>
        ))}

        <div className="px-5 py-3 mt-2 text-[10px] font-bold uppercase tracking-widest text-ink-soft">Service Professionals near you</div>
        <div className="px-5 pb-6 space-y-2">
          {[
            { n: "Ravi Kumar", role: "Electrician", d: "1.2 km", init: "RK" },
            { n: "Suresh", role: "Priest / Pandit", d: "2.5 km", init: "SU" },
            { n: "Meera Flowers", role: "Flower Supplier", d: "3.1 km", init: "MF" },
          ].map((p) => (
            <div key={p.n} className="p-3 rounded-2xl bg-muted flex items-center gap-3">
              <div className="size-11 rounded-xl bg-gradient-to-br from-gold/30 to-earth/20 grid place-items-center font-bold text-earth">{p.init}</div>
              <div className="flex-1">
                <div className="font-semibold text-ink text-sm">{p.n}</div>
                <div className="text-xs text-ink-soft">{p.role} · {p.d}</div>
              </div>
              <button className="size-10 rounded-full bg-earth grid place-items-center">
                <MessageCircle className="size-4 text-primary-foreground" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- PROFILE ---------------- */
function ProfileScreen() {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      <div className="bg-gradient-to-br from-earth to-earth/70 px-5 pt-6 pb-8 text-primary-foreground">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-full bg-cream text-earth grid place-items-center text-2xl font-bold ring-4 ring-cream/30">A</div>
          <div>
            <div className="text-lg font-bold">Anand Nambissan</div>
            <div className="text-sm text-primary-foreground/80">+91 94966 86256</div>
            <div className="font-ml text-xs text-primary-foreground/70 mt-0.5">രോഹിണി · Rohini</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-6">
          <Stat n="12" l="Bookings" />
          <Stat n="4" l="Temples" />
          <Stat n="₹2.4k" l="Donated" />
        </div>
      </div>

      <div className="p-4 space-y-2 bg-card flex-1">
        {[
          { i: CalendarDays, l: "My Bookings", s: "Upcoming and past poojas" },
          { i: Heart, l: "Saved Temples", s: "Your favorites" },
          { i: MessageCircle, l: "Chats & Groups", s: "Manage conversations" },
          { i: ShieldCheck, l: "Verify Devotee ID", s: "Get verified badge" },
          { i: MapPin, l: "Change Location", s: "Vaikom, Kottayam" },
          { i: User, l: "Language", s: "English · Malayalam" },
        ].map((it) => (
          <button key={it.l} className="w-full p-3 rounded-2xl bg-muted flex items-center gap-3 active:scale-[0.99] transition">
            <div className="size-11 rounded-xl bg-earth-soft grid place-items-center">
              <it.i className="size-5 text-earth" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-ink text-sm">{it.l}</div>
              <div className="text-xs text-ink-soft">{it.s}</div>
            </div>
            <ChevronRight className="size-4 text-ink-soft" />
          </button>
        ))}
      </div>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="rounded-2xl bg-cream/15 backdrop-blur px-3 py-2.5 text-center">
      <div className="font-serif text-xl">{n}</div>
      <div className="text-[10px] uppercase tracking-wider text-primary-foreground/80">{l}</div>
    </div>
  );
}
