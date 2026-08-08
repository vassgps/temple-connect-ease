import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, Camera, Check, CheckCheck, ChevronDown,
  Image as ImageIcon, Landmark, MapPin, Mic, MoreVertical, Send, Sparkles,
  CalendarDays, Store, ListChecks, Play, Edit3, ShieldCheck, FileText, X,
} from "lucide-react";
import meenakshi from "@/assets/meenakshi.jpg";
import logoMarkAsset from "@/assets/logo-mark.png.asset.json";

const logoMark = logoMarkAsset.url;

/* ================= STEP DEFINITIONS (37 steps) ================= */
type StepType = "text" | "long" | "choice" | "multi" | "media" | "gps" | "time";
type Step = {
  key: string;
  section: string;
  q: string;
  type: StepType;
  opts?: string[];
  optional?: boolean;
  hint?: string;
  multiFiles?: boolean;
};

const templeSteps: Step[] = [
  { key: "name", section: "Basic Details", q: "What is the temple's name? 🛕", type: "text", hint: "e.g. Sree Krishna Temple" },
  { key: "subtitle", section: "Basic Details", q: "Any subtitle or short tagline?", type: "text", optional: true },
  { key: "category", section: "Basic Details", q: "Which category does it belong to?", type: "choice", opts: ["HINDU TEMPLES", "KAVU", "JAIN TEMPLES", "BUDDHIST PAGODA", "GURUDWARA", "CHURCH", "MOSQUE"] },
  { key: "about", section: "About the Temple", q: "Tell me a little about the temple. You can type or send a voice note 🎤", type: "long" },
  { key: "mainPhoto", section: "Photos & Media", q: "Please share the main photo of the temple.", type: "media" },
  { key: "gallery", section: "Photos & Media", q: "Any more photos for the gallery?", type: "media", multiFiles: true, optional: true },
  { key: "poojaPhotos", section: "Photos & Media", q: "Upload photos of the pooja list. You can add multiple images.", type: "media", multiFiles: true, optional: true },
  { key: "docs", section: "Photos & Media", q: "Other documents (PDF or images)? Brochures or info related to the temple.", type: "media", multiFiles: true, optional: true },
  { key: "landmark", section: "Location", q: "What's the location name / landmark?", type: "text" },
  { key: "city", section: "Location", q: "City?", type: "text" },
  { key: "state", section: "Location", q: "State?", type: "text" },
  { key: "pincode", section: "Location", q: "Pincode?", type: "text" },
  { key: "address", section: "Location", q: "Full address?", type: "long" },
  { key: "gps", section: "Location", q: "Tap below to capture exact GPS coordinates 📍", type: "gps" },
  { key: "phone", section: "Contact", q: "Primary contact number?", type: "text" },
  { key: "whatsapp", section: "Contact", q: "WhatsApp number (if different)?", type: "text", optional: true },
  { key: "email", section: "Contact", q: "Email ID (optional)?", type: "text", optional: true },
  { key: "personName", section: "People in Charge", q: "Name of the designated person?", type: "text" },
  { key: "designation", section: "People in Charge", q: "Their designation?", type: "choice", opts: ["Trustee", "Secretary", "President", "Manager", "Melsanthi / Priest"] },
  { key: "personPhone", section: "People in Charge", q: "Their contact number?", type: "text" },
  { key: "management", section: "Religious Info", q: "Type of management?", type: "choice", opts: ["Trust", "Devaswom Board", "Family / Private", "Community Committee", "Government"] },
  { key: "mainDeity", section: "Religious Info", q: "Who is the main deity?", type: "choice", opts: ["LORD GANESH", "LORD KRISHNA", "LORD SHIVA", "LORD AYYAPPA", "LORD BHAGAVATHY", "LORD VISHNU", "KIRATHAMOORTHY"] },
  { key: "otherDeities", section: "Religious Info", q: "Any other deities worshipped here?", type: "multi", opts: ["KIRATHAMOORTHY", "LORD AYYAPPA", "LORD BHAGAVATHY", "LORD GANESH", "LORD KRISHNA", "NAGA DEVATHA", "LORD SHIVA"], optional: true },
  { key: "mOpen", section: "Timings", q: "Morning opening time?", type: "time" },
  { key: "mClose", section: "Timings", q: "Morning closing time?", type: "time" },
  { key: "eOpen", section: "Timings", q: "Evening opening time?", type: "time" },
  { key: "eClose", section: "Timings", q: "Evening closing time?", type: "time", optional: true },
  { key: "story", section: "Story & History", q: "Share the story of the temple ✨", type: "long" },
  { key: "history", section: "Story & History", q: "Any historical details?", type: "long", optional: true },
  { key: "dress", section: "Story & History", q: "Dress code for visitors?", type: "long", optional: true },
  { key: "special", section: "Story & History", q: "What makes this temple special?", type: "long", optional: true },
  { key: "notes", section: "Story & History", q: "Anything else visitors should know?", type: "long", optional: true },
  { key: "thanthri", section: "Story & History", q: "Name of the Temple Thanthri?", type: "text", optional: true },
  { key: "upi", section: "KYC & Payment", q: "UPI ID for donations?", type: "text", optional: true },
  { key: "upiQr", section: "KYC & Payment", q: "Upload UPI QR code image.", type: "media", optional: true },
  { key: "events", section: "Events", q: "Main events — share short notes.", type: "long", optional: true },
  { key: "eventMedia", section: "Events", q: "Attach photos or files about events?", type: "media", multiFiles: true, optional: true },
];

export type FlowKind = "temple" | "service" | "event" | "business";

const flowMeta: Record<FlowKind, { title: string; steps: Step[] }> = {
  temple: { title: "Temple Details", steps: templeSteps },
  service: {
    title: "Service Details",
    steps: [
      { key: "name", section: "Basic Details", q: "What is your service name? 🙏", type: "text" },
      { key: "category", section: "Basic Details", q: "Which service category?", type: "choice", opts: ["PRIEST / PANDIT", "FLOWERS & GARLAND", "SOUND & LIGHTS", "ELECTRICIAN", "CATERING", "TRANSPORT"] },
      { key: "about", section: "Basic Details", q: "Tell me about your service. Type or send a voice note 🎤", type: "long" },
      { key: "photo", section: "Photos & Media", q: "Share a photo for your service profile.", type: "media" },
      { key: "city", section: "Location", q: "Which city / area do you serve?", type: "text" },
      { key: "gps", section: "Location", q: "Tap below to capture your location 📍", type: "gps" },
      { key: "phone", section: "Contact", q: "Booking contact number?", type: "text" },
      { key: "rate", section: "Offerings", q: "Starting price (₹)?", type: "text", optional: true },
      { key: "offerings", section: "Offerings", q: "List your main offerings.", type: "long", optional: true },
    ],
  },
  event: {
    title: "Event Details",
    steps: [
      { key: "name", section: "Basic Details", q: "What is the event name? 🎉", type: "text" },
      { key: "temple", section: "Basic Details", q: "Which temple or place is it at?", type: "text" },
      { key: "kind", section: "Basic Details", q: "Event type?", type: "choice", opts: ["FESTIVAL", "SPECIAL POOJA", "ANNADANAM", "CULTURAL PROGRAM", "PROCESSION"] },
      { key: "start", section: "Dates", q: "Start date?", type: "text", hint: "e.g. 22 Jul 2026" },
      { key: "end", section: "Dates", q: "End date?", type: "text", optional: true },
      { key: "time", section: "Dates", q: "Main event time?", type: "time" },
      { key: "performers", section: "Details", q: "Performers or chief guests?", type: "long", optional: true },
      { key: "banner", section: "Photos & Media", q: "Upload the event banner or poster.", type: "media" },
      { key: "about", section: "Details", q: "Short note about the event.", type: "long", optional: true },
    ],
  },
  business: {
    title: "Local Business",
    steps: [
      { key: "name", section: "Basic Details", q: "Business name?", type: "text" },
      { key: "category", section: "Basic Details", q: "Which type of business?", type: "choice", opts: ["HOTEL / LODGE", "RESTAURANT", "TRAVELS", "POOJA SHOP", "TAXI", "OTHER SHOP"] },
      { key: "about", section: "Basic Details", q: "Tell me about the business.", type: "long" },
      { key: "photo", section: "Photos & Media", q: "Share a photo of the shop front.", type: "media" },
      { key: "address", section: "Location", q: "Full address?", type: "long" },
      { key: "gps", section: "Location", q: "Capture exact location 📍", type: "gps" },
      { key: "phone", section: "Contact", q: "Contact number?", type: "text" },
      { key: "hours", section: "Details", q: "Opening hours?", type: "text", optional: true },
    ],
  },
};

/* ================= LISTING HUB ================= */
const hubCards: { kind: FlowKind | "listings"; title: string; sub: string; icon: typeof Landmark; cls: string }[] = [
  { kind: "temple", title: "Add Temples", sub: "Temple details, deity, timing and contact info.", icon: Landmark, cls: "bg-gradient-to-br from-earth to-earth/80 text-primary-foreground" },
  { kind: "service", title: "Add Services", sub: "Service profile, booking contact and offerings.", icon: Sparkles, cls: "bg-gradient-to-br from-verified to-verified/75 text-primary-foreground" },
  { kind: "event", title: "Add Events", sub: "Event name, dates, performers and banner media.", icon: CalendarDays, cls: "bg-gradient-to-br from-gold to-gold/70 text-ink" },
  { kind: "business", title: "Add Local Business", sub: "Hotels, restaurants, travels, shops and nearby support listings.", icon: Store, cls: "bg-gradient-to-br from-[oklch(0.45_0.09_255)] to-[oklch(0.38_0.08_255)] text-primary-foreground" },
  { kind: "listings", title: "View My Listings", sub: "See all listings added by your phone number.", icon: ListChecks, cls: "bg-gradient-to-br from-[oklch(0.28_0.02_250)] to-[oklch(0.2_0.02_250)] text-primary-foreground" },
];

export function ListingHub({ back, start, openListings, phone }: { back: () => void; start: (k: FlowKind) => void; openListings: () => void; phone: string }) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-cream">
      <header className="px-4 pt-3 pb-4 bg-card flex items-center gap-3 sticky top-0 z-10 border-b border-border">
        <button onClick={back} className="size-10 rounded-full bg-muted grid place-items-center"><ArrowLeft className="size-5 text-ink" /></button>
        <div className="flex-1">
          <div className="text-lg font-serif font-bold text-ink">Add a Listing</div>
          <div className="text-xs text-ink-soft flex items-center gap-1"><ShieldCheck className="size-3 text-verified" /> +91 {phone}</div>
        </div>
        <img src={logoMark} alt="TempleAddress" className="size-8" />
      </header>

      <div className="p-4 space-y-3">
        <p className="text-sm text-ink-soft leading-relaxed">
          Our listing helper will guide you step-by-step, in a simple chat — just like WhatsApp. No forms, no typing long pages.
        </p>
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted">
          <img src={meenakshi} alt="Listing helper" width={816} height={816} loading="lazy" className="size-14 rounded-full object-cover object-top ring-2 ring-card" />
          <div>
            <div className="font-bold text-ink">Listing helper is ready to guide you.</div>
            <div className="text-sm text-ink-soft">Choose the action you want to continue with.</div>
          </div>
        </div>

        {hubCards.map((c) => (
          <button
            key={c.title}
            onClick={() => (c.kind === "listings" ? openListings() : start(c.kind as FlowKind))}
            className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 shadow-soft ${c.cls}`}
          >
            <div className="size-12 rounded-full bg-white/15 grid place-items-center shrink-0"><c.icon className="size-6" /></div>
            <div className="flex-1">
              <div className="text-lg font-bold leading-tight">{c.title}</div>
              <div className="text-sm opacity-85 leading-snug">{c.sub}</div>
            </div>
            <ArrowRight className="size-5 opacity-80 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ================= MY LISTINGS ================= */
const myListings = [
  { name: "Sri Kolathoorappan Temple", place: "Palakkad, Kerala", status: "verified" },
  { name: "Sree Krishna Temple", place: "Mayanad, Calicut", status: "pending" },
  { name: "Ramesh Pandit Ji · Priest", place: "Vaikom", status: "verified" },
];

export function MyListings({ back }: { back: () => void }) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-cream">
      <header className="px-4 pt-3 pb-4 bg-card flex items-center gap-3 border-b border-border sticky top-0 z-10">
        <button onClick={back} className="size-10 rounded-full bg-muted grid place-items-center"><ArrowLeft className="size-5 text-ink" /></button>
        <div className="text-lg font-serif font-bold text-ink">My Listings</div>
      </header>
      <div className="p-4 space-y-3">
        {myListings.map((l) => (
          <div key={l.name} className="p-4 rounded-2xl bg-card ring-1 ring-border">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="font-semibold text-ink leading-tight">{l.name}</div>
                <div className="text-xs text-ink-soft flex items-center gap-1 mt-0.5"><MapPin className="size-3" /> {l.place}</div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${l.status === "verified" ? "bg-verified/15 text-verified" : "bg-gold/25 text-earth"}`}>{l.status}</span>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3">
              {["Edit", "Poojas", "Events", "View"].map((a) => (
                <button key={a} className="py-2 rounded-xl bg-muted text-xs font-semibold text-ink-soft">{a}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= MEENAKSHI CHAT FLOW ================= */
type Bubble = { id: number; from: "bot" | "me"; text?: string; kind?: "text" | "image" | "voice" | "file"; meta?: string };

const now = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export function MeenakshiFlow({ kind, phone, back, onSubmitted }: { kind: FlowKind; phone: string; back: () => void; onSubmitted: () => void }) {
  const meta = flowMeta[kind];
  const steps = meta.steps;
  const total = steps.length;

  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [msgs, setMsgs] = useState<Bubble[]>([
    { id: 1, from: "bot", text: `🙏 Welcome to Temple Address — Add ${meta.title}` },
    { id: 2, from: "bot", text: "I'll help you add it step-by-step, just like a WhatsApp chat." },
    { id: 3, from: "bot", text: "Before starting: please be inside the premises and allow permissions — Location, Camera, Gallery, Microphone." },
  ]);
  const [review, setReview] = useState(false);
  const [done, setDone] = useState(false);
  const [lang, setLang] = useState<"EN" | "ML">("EN");
  const [editKey, setEditKey] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const step: Step | undefined = steps[idx];
  const editStep = editKey ? steps.find((s) => s.key === editKey) : undefined;
  const active = editStep ?? step;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, review]);

  const push = (b: Omit<Bubble, "id">) => setMsgs((m) => [...m, { ...b, id: Date.now() + Math.random() }]);

  const ask = (i: number) => {
    const s = steps[i];
    if (!s) { setReview(true); return; }
    push({ from: "bot", text: s.q });
  };

  const start = () => {
    setStarted(true);
    push({ from: "me", text: `Start ${meta.title} Flow` });
    setTimeout(() => ask(0), 250);
  };

  const answer = (value: string, bubble?: Omit<Bubble, "id" | "from">) => {
    const key = active!.key;
    setAnswers((a) => ({ ...a, [key]: value }));
    if (editStep) {
      push({ from: "me", ...(bubble ?? { text: value }) });
      push({ from: "bot", text: "✅ Updated. Back to review." });
      setEditKey(null);
      setReview(true);
      return;
    }
    push({ from: "me", ...(bubble ?? { text: value || "—" }) });
    const next = idx + 1;
    setIdx(next);
    setTimeout(() => ask(next), 300);
  };

  const skip = () => answer("");

  if (done) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-4 p-8 bg-cream text-center">
        <div className="size-20 rounded-full bg-verified grid place-items-center"><Check className="size-10 text-primary-foreground" /></div>
        <div className="text-2xl font-serif font-bold text-ink">Submitted for review 🙏</div>
        <p className="text-ink-soft">We have sent your {meta.title.toLowerCase()} to our team. You'll get a WhatsApp update on +91 {phone} once verified.</p>
        <button onClick={onSubmitted} className="w-full py-4 rounded-2xl bg-earth text-primary-foreground text-lg font-bold shadow-soft">Back to Listings</button>
      </div>
    );
  }

  if (review) {
    const sections = [...new Set(steps.map((s) => s.section))];
    return (
      <div className="flex-1 min-h-0 flex flex-col bg-cream">
        <FlowHeader title="Listing Helper" sub="Review" phone={phone} lang={lang} setLang={setLang} back={() => setReview(false)} progress={1} idx={total} total={total} />
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="p-3 rounded-2xl bg-card ring-1 ring-border text-sm text-ink-soft">
            📋 Please review the details before submission.<br />
            📱 91{phone} · ✏️ Tap any row to edit before submitting.
          </div>
          {sections.map((sec) => (
            <div key={sec}>
              <div className="text-xs font-bold uppercase tracking-wide text-earth mb-2">{sec}</div>
              <div className="rounded-2xl bg-card ring-1 ring-border divide-y divide-border overflow-hidden">
                {steps.filter((s) => s.section === sec).map((s) => (
                  <button key={s.key} onClick={() => { setEditKey(s.key); setReview(false); push({ from: "bot", text: s.q }); }} className="w-full text-left px-4 py-3 flex items-center gap-3 active:bg-muted">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-ink-soft leading-snug">{s.q}</div>
                      <div className="text-[15px] font-semibold text-ink truncate">{answers[s.key] || "—"}</div>
                    </div>
                    <span className="text-xs font-bold text-earth flex items-center gap-1"><Edit3 className="size-3.5" /> Edit</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 bg-card border-t border-border">
          <button onClick={() => setDone(true)} className="w-full py-4 rounded-2xl bg-verified text-primary-foreground text-lg font-bold shadow-soft">✅ Confirm & Submit</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-chat-bg">
      <FlowHeader
        title="Listing Helper"
        sub={active ? active.section : meta.title}
        phone={phone} lang={lang} setLang={setLang}
        back={editStep ? () => { setEditKey(null); setReview(true); } : back}
        progress={started ? idx / total : 0}
        idx={started ? idx : 0}
        total={total}
      />

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2" style={{ backgroundImage: "radial-gradient(oklch(0.9 0.02 60) 1px, transparent 1px)", backgroundSize: "18px 18px" }}>
        {!started && (
          <div className="grid place-items-center pb-2">
            <img src={meenakshi} alt="Listing helper" width={816} height={816} className="w-40 rounded-2xl object-cover ring-1 ring-black/5" />
          </div>
        )}
        {msgs.map((m) => (
          <div key={m.id} className={`flex items-end gap-2 ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            {m.from === "bot" && <img src={meenakshi} alt="" width={816} height={816} loading="lazy" className="size-8 rounded-full object-cover object-top shrink-0" />}
            <div className={`max-w-[80%] px-3.5 py-2 rounded-2xl shadow-sm ${m.from === "me" ? "bg-chat-out rounded-br-md" : "bg-chat-in rounded-bl-md"}`}>
              {m.kind === "image" && <div className="mb-1 h-24 w-40 rounded-lg bg-earth-soft/60 grid place-items-center"><ImageIcon className="size-7 text-earth" /></div>}
              {m.kind === "file" && <div className="mb-1 flex items-center gap-2 p-2 bg-cream/70 rounded-lg"><FileText className="size-4 text-earth" /><span className="text-xs font-semibold">{m.meta}</span></div>}
              {m.kind === "voice" && <div className="mb-1 flex items-center gap-2 p-2 bg-cream/70 rounded-lg w-44"><Play className="size-4 text-earth" /><div className="h-1 flex-1 rounded bg-earth/30" /><span className="text-[11px]">0:{m.meta ?? "06"}</span></div>}
              {m.text && <p className="text-[15px] leading-snug text-ink whitespace-pre-wrap">{m.text}</p>}
              <div className={`text-[10px] mt-0.5 flex items-center gap-1 ${m.from === "me" ? "justify-end text-ink-soft" : "text-ink-soft"}`}>
                {now()} {m.from === "me" && <CheckCheck className="size-3 text-verified" />}
              </div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {!started ? (
        <div className="p-3 bg-transparent">
          <button onClick={start} className="w-full py-4 rounded-2xl bg-earth text-primary-foreground text-lg font-bold shadow-soft">Start {meta.title} Flow</button>
        </div>
      ) : active ? (
        <Answerer key={active.key + (editStep ? "-edit" : "")} step={active} onAnswer={answer} onSkip={skip} onBack={() => { if (editStep) { setEditKey(null); setReview(true); } else if (idx > 0) { setIdx(idx - 1); ask(idx - 1); } }} />
      ) : null}
    </div>
  );
}

function FlowHeader({ title, sub, phone, lang, setLang, back, progress, idx, total }: {
  title: string; sub: string; phone: string; lang: "EN" | "ML"; setLang: (l: "EN" | "ML") => void;
  back: () => void; progress: number; idx: number; total: number;
}) {
  return (
    <header className="bg-earth text-primary-foreground px-3 pt-3 pb-2 shrink-0">
      <div className="flex items-center gap-2">
        <button onClick={back} className="size-9 grid place-items-center"><ArrowLeft className="size-5" /></button>
        <div className="relative shrink-0">
          <img src={meenakshi} alt="Listing helper" width={816} height={816} className="size-10 rounded-full object-cover object-top ring-2 ring-cream/40" />
          <span className="absolute bottom-0 right-0 size-3 rounded-full bg-verified ring-2 ring-earth" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold leading-tight truncate">{title}</div>
          <div className="text-[11px] text-primary-foreground/80 truncate">online · {sub}</div>
        </div>
        <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-cream/15">+91{phone}</span>
        <button onClick={() => setLang(lang === "EN" ? "ML" : "EN")} className="text-[11px] font-bold px-2 py-1 rounded-full bg-cream/15 flex items-center gap-0.5">{lang}<ChevronDown className="size-3" /></button>
        <button className="size-8 grid place-items-center"><MoreVertical className="size-4" /></button>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <div className="h-1.5 flex-1 rounded-full bg-cream/25 overflow-hidden">
          <div className="h-full bg-cream rounded-full transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <span className="text-[11px] font-semibold shrink-0">Step {Math.min(idx + 1, total)} of {total}</span>
      </div>
    </header>
  );
}

/* --------- input area per step type --------- */
function Answerer({ step, onAnswer, onSkip, onBack }: {
  step: Step;
  onAnswer: (v: string, bubble?: Omit<Bubble, "id" | "from">) => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const [text, setText] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);

  const NavRow = (
    <div className="flex gap-2 pt-2">
      <button onClick={onBack} className="flex-1 py-3 rounded-2xl bg-card ring-1 ring-border font-semibold text-ink">← Back</button>
      {step.optional && <button onClick={onSkip} className="flex-1 py-3 rounded-2xl bg-muted font-semibold text-ink-soft">Skip →</button>}
    </div>
  );

  if (step.type === "choice") {
    return (
      <div className="p-3 bg-card border-t border-border max-h-[52%] overflow-y-auto space-y-2">
        {step.opts!.map((o) => (
          <button key={o} onClick={() => onAnswer(o)} className="w-full flex items-center gap-3 p-3 rounded-2xl bg-cream ring-1 ring-border text-left active:bg-muted">
            <span className="size-9 rounded-lg bg-earth-soft text-earth grid place-items-center text-xs font-bold shrink-0">TA</span>
            <span className="font-semibold text-ink">{o}</span>
          </button>
        ))}
        {NavRow}
      </div>
    );
  }

  if (step.type === "multi") {
    const toggle = (o: string) => setPicked((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]));
    return (
      <div className="p-3 bg-card border-t border-border max-h-[56%] overflow-y-auto space-y-2">
        {step.opts!.map((o) => (
          <button key={o} onClick={() => toggle(o)} className="w-full flex items-center gap-3 p-3 rounded-2xl bg-cream ring-1 ring-border text-left">
            <span className={`size-6 rounded-md grid place-items-center shrink-0 ${picked.includes(o) ? "bg-verified" : "ring-2 ring-border"}`}>{picked.includes(o) && <Check className="size-4 text-primary-foreground" />}</span>
            <span className="size-9 rounded-lg bg-earth-soft text-earth grid place-items-center text-xs font-bold shrink-0">TA</span>
            <span className="font-semibold text-ink">{o}</span>
          </button>
        ))}
        <button disabled={!picked.length} onClick={() => onAnswer(picked.join(", "))} className={`w-full py-3.5 rounded-2xl font-bold text-primary-foreground ${picked.length ? "bg-earth" : "bg-earth/45"}`}>Done ({picked.length})</button>
        {NavRow}
      </div>
    );
  }

  if (step.type === "media") {
    return (
      <div className="p-3 bg-card border-t border-border space-y-2">
        <div className="flex gap-2">
          <button onClick={() => setFiles((f) => [...f, `photo_${f.length + 1}.jpg`])} className="flex-1 py-3.5 rounded-2xl bg-verified text-primary-foreground font-bold flex items-center justify-center gap-2"><Camera className="size-5" /> Take photo</button>
          <button onClick={() => setFiles((f) => [...f, `upload_${f.length + 1}.jpg`])} className="flex-1 py-3.5 rounded-2xl bg-cream ring-1 ring-border font-bold text-ink flex items-center justify-center gap-2"><ImageIcon className="size-5" /> Upload</button>
        </div>
        {!!files.length && (
          <div className="flex gap-2 flex-wrap">
            {files.map((f, i) => (
              <span key={f + i} className="text-[11px] px-2 py-1 rounded-full bg-muted text-ink-soft flex items-center gap-1">
                {f}<button onClick={() => setFiles((x) => x.filter((_, j) => j !== i))}><X className="size-3" /></button>
              </span>
            ))}
          </div>
        )}
        <button disabled={!files.length} onClick={() => onAnswer(files.join(", "), { kind: "image", text: files.join(", ") })} className={`w-full py-3.5 rounded-2xl font-bold text-primary-foreground ${files.length ? "bg-earth" : "bg-earth/45"}`}>Send ({files.length} files)</button>
        {NavRow}
      </div>
    );
  }

  if (step.type === "gps") {
    return (
      <div className="p-3 bg-card border-t border-border space-y-2">
        <button onClick={() => onAnswer("📍 10.59956, 76.54891")} className="w-full py-4 rounded-2xl bg-earth text-primary-foreground font-bold flex items-center justify-center gap-2"><MapPin className="size-5" /> Capture my GPS location</button>
        {NavRow}
      </div>
    );
  }

  if (step.type === "time") {
    return (
      <div className="p-3 bg-card border-t border-border space-y-2">
        <input type="time" value={text} onChange={(e) => setText(e.target.value)} className="w-full px-4 py-3.5 rounded-2xl bg-cream ring-1 ring-border text-lg font-semibold text-ink outline-none" />
        <button disabled={!text} onClick={() => onAnswer(text)} className={`w-full py-3.5 rounded-2xl font-bold text-primary-foreground ${text ? "bg-earth" : "bg-earth/45"}`}>Send time</button>
        {NavRow}
      </div>
    );
  }

  // text / long
  return (
    <div className="p-3 bg-card border-t border-border space-y-2">
      <div className="flex items-end gap-2">
        <textarea
          rows={step.type === "long" ? 2 : 1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={step.hint ?? "Type your answer…"}
          className="flex-1 px-4 py-3 rounded-2xl bg-cream ring-1 ring-border text-[15px] text-ink outline-none resize-none"
        />
        <button
          onClick={() => (text.trim() ? onAnswer(text.trim()) : onAnswer("Voice note", { kind: "voice", meta: "06" }))}
          className="size-12 rounded-full bg-earth grid place-items-center shrink-0 shadow-soft"
        >
          {text.trim() ? <Send className="size-5 text-primary-foreground" /> : <Mic className="size-5 text-primary-foreground" />}
        </button>
      </div>
      {NavRow}
    </div>
  );
}
