import { useState } from "react";
import {
  Landmark, CalendarDays, Wrench, MapPin, Camera, Check, ChevronRight,
  ArrowLeft, Mic, Sparkles, ShieldCheck, Clock,
} from "lucide-react";

export type SubmitKind = "temple" | "festival" | "service";

type Field = { key: string; label: string; ml?: string; placeholder: string; type?: "text" | "tel" | "date" | "choice"; options?: string[] };

const kindMeta: Record<SubmitKind, { title: string; ml: string; sub: string; icon: typeof Landmark; cls: string; fields: Field[] }> = {
  temple: {
    title: "Add Temple", ml: "ക്ഷേത്രം ചേർക്കുക", sub: "Name, place, deity — 1 minute",
    icon: Landmark, cls: "from-earth/20 to-gold/15 ring-earth/25",
    fields: [
      { key: "name", label: "Temple name", ml: "ക്ഷേത്രത്തിന്റെ പേര്", placeholder: "Vaikom Mahadeva Temple" },
      { key: "deity", label: "Main deity", ml: "പ്രധാന ദേവൻ", placeholder: "Select deity", type: "choice", options: ["Shiva", "Vishnu", "Devi", "Ayyappa", "Ganapathi", "Other"] },
      { key: "place", label: "Village / Town", ml: "സ്ഥലം", placeholder: "Vaikom, Kottayam" },
      { key: "phone", label: "Temple contact number", placeholder: "9876543210", type: "tel" },
    ],
  },
  festival: {
    title: "Add Festival / Event", ml: "ഉത്സവം ചേർക്കുക", sub: "Festival name, temple, date",
    icon: CalendarDays, cls: "from-gold/25 to-earth/10 ring-gold/30",
    fields: [
      { key: "name", label: "Festival / Event name", ml: "ഉത്സവത്തിന്റെ പേര്", placeholder: "Ashtami Rohini" },
      { key: "temple", label: "Temple name", ml: "ക്ഷേത്രം", placeholder: "Vaikom Mahadeva Temple" },
      { key: "date", label: "Start date", ml: "തീയതി", placeholder: "", type: "date" },
      { key: "place", label: "Village / Town", placeholder: "Vaikom, Kottayam" },
    ],
  },
  service: {
    title: "Add Service", ml: "സേവനം ചേർക്കുക", sub: "Priest, flowers, sound, catering…",
    icon: Wrench, cls: "from-verified/20 to-earth/10 ring-verified/25",
    fields: [
      { key: "name", label: "Your / shop name", ml: "പേര്", placeholder: "Ramesh Pandit Ji" },
      { key: "category", label: "Service type", ml: "സേവനം", placeholder: "Select type", type: "choice", options: ["Priest / Poojari", "Flowers & Garland", "Sound & Light", "Catering", "Electrician", "Other"] },
      { key: "place", label: "Service area", placeholder: "Vaikom, Kottayam" },
      { key: "phone", label: "Mobile number", placeholder: "9876543210", type: "tel" },
    ],
  },
};

export type Submission = {
  id: string;
  kind: SubmitKind;
  name: string;
  place: string;
  status: "pending" | "verified";
  completeness: number;
  data?: Record<string, string>;
};

const deityMap: Record<string, string> = {
  Shiva: "LORD SHIVA", Vishnu: "LORD VISHNU", Devi: "LORD BHAGAVATHY",
  Ayyappa: "LORD AYYAPPA", Ganapathi: "LORD GANESH",
};

/** Map the 4 quick-form answers onto the detailed listing-flow step keys. */
export function toPrefill(kind: SubmitKind, v: Record<string, string>): Record<string, string> {
  const p: Record<string, string> = {};
  if (v.name) p.name = v.name;
  if (v.phone) p.phone = v.phone;
  if (kind === "temple") {
    if (v.place) { p.landmark = v.place; p.city = v.place.split(",").pop()!.trim(); }
    if (v.deity && deityMap[v.deity]) p.mainDeity = deityMap[v.deity];
  }
  if (kind === "service" && v.place) p.city = v.place;
  if (kind === "festival") {
    if (v.temple) p.temple = v.temple;
    if (v.date) p.start = v.date;
  }
  return p;
}

const seed: Submission[] = [
  { id: "s1", kind: "temple", name: "Sree Karthyayani Temple", place: "Cherthala", status: "verified", completeness: 100, data: { name: "Sree Karthyayani Temple", place: "Cherthala", deity: "Devi" } },
  { id: "s2", kind: "service", name: "Anand Poojari", place: "Vaikom", status: "pending", completeness: 45, data: { name: "Anand Poojari", place: "Vaikom", phone: "9847012345" } },
];

/* ---------------- MAIN SUBMIT TAB ---------------- */
export function SubmitScreen({
  logoMark, openFullFlow,
}: {
  logoMark: string;
  openFullFlow: (kind: SubmitKind) => void;
}) {
  const [form, setForm] = useState<SubmitKind | null>(null);
  const [items, setItems] = useState<Submission[]>(seed);
  const [saved, setSaved] = useState<Submission | null>(null);

  if (saved) {
    return <SavedCard item={saved} onDone={() => setSaved(null)} onMore={() => { const k = saved.kind; setSaved(null); openFullFlow(k); }} />;
  }

  if (form) {
    return (
      <QuickForm
        kind={form}
        back={() => setForm(null)}
        onSave={(name, place) => {
          const item: Submission = { id: `u${Date.now()}`, kind: form, name, place, status: "pending", completeness: 40 };
          setItems((p) => [item, ...p]);
          setForm(null);
          setSaved(item);
        }}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <header className="px-5 pt-3 pb-4 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <img src={logoMark} alt="" className="size-9" />
          <span className="font-serif text-xl font-bold text-earth">Submit Details</span>
        </div>
        <p className="text-sm text-ink-soft mt-2 leading-snug">
          Add a temple, festival or service. Only 4 questions now — you can add more details later.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-3">
          {(Object.keys(kindMeta) as SubmitKind[]).map((k) => {
            const m = kindMeta[k];
            const Icon = m.icon;
            return (
              <button key={k} onClick={() => setForm(k)} className={`w-full p-4 rounded-3xl bg-gradient-to-br ${m.cls} ring-1 flex items-center gap-4 text-left active:scale-[0.99] transition`}>
                <div className="size-14 rounded-2xl bg-card grid place-items-center shadow-soft shrink-0">
                  <Icon className="size-7 text-earth" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-lg font-bold text-ink">{m.title}</div>
                  <div className="text-xs text-earth font-semibold">{m.ml}</div>
                  <div className="text-xs text-ink-soft mt-0.5">{m.sub}</div>
                </div>
                <ChevronRight className="size-6 text-earth shrink-0" />
              </button>
            );
          })}
        </div>

        <div className="px-5 pt-2 pb-2 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-ink">My Submissions</h2>
          <span className="text-xs text-ink-soft">{items.length} total</span>
        </div>

        <div className="px-4 space-y-2">
          {items.map((it) => {
            const Icon = kindMeta[it.kind].icon;
            return (
              <div key={it.id} className="p-4 rounded-2xl bg-card ring-1 ring-border">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-earth-soft grid place-items-center shrink-0"><Icon className="size-5 text-earth" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink text-sm truncate">{it.name}</div>
                    <div className="text-xs text-ink-soft flex items-center gap-1"><MapPin className="size-3" />{it.place}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase shrink-0 ${it.status === "verified" ? "bg-verified/15 text-verified" : "bg-gold/25 text-earth"}`}>
                    {it.status === "verified" ? <span className="flex items-center gap-1"><ShieldCheck className="size-3" />verified</span> : <span className="flex items-center gap-1"><Clock className="size-3" />pending</span>}
                  </span>
                </div>
                {it.completeness < 100 && (
                  <>
                    <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-earth rounded-full" style={{ width: `${it.completeness}%` }} />
                    </div>
                    <button onClick={() => openFullFlow(it.kind)} className="mt-3 w-full h-11 rounded-xl bg-earth-soft text-earth font-bold text-sm flex items-center justify-center gap-2">
                      <Sparkles className="size-4" /> Add more details ({it.completeness}% complete)
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------- QUICK FORM (4 fields) ---------------- */
function QuickForm({ kind, back, onSave }: { kind: SubmitKind; back: () => void; onSave: (name: string, place: string) => void }) {
  const meta = kindMeta[kind];
  const [values, setValues] = useState<Record<string, string>>({});
  const [photo, setPhoto] = useState(false);
  const set = (k: string, v: string) => setValues((p) => ({ ...p, [k]: v }));
  const required = meta.fields.map((f) => f.key);
  const ready = required.every((k) => (values[k] ?? "").trim().length > 1);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-cream">
      <header className="px-3 py-3 bg-card border-b border-border flex items-center gap-2 shrink-0">
        <button onClick={back} className="size-10 grid place-items-center"><ArrowLeft className="size-5 text-ink" /></button>
        <div className="flex-1">
          <div className="font-serif text-lg font-bold text-ink">{meta.title}</div>
          <div className="text-xs text-earth font-semibold">{meta.ml}</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {meta.fields.map((f) => (
          <div key={f.key}>
            <label className="text-sm font-bold text-ink">
              {f.label} <span className="text-destructive">*</span>
              {f.ml && <span className="block text-xs font-semibold text-earth mt-0.5">{f.ml}</span>}
            </label>
            {f.type === "choice" ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {f.options!.map((o) => (
                  <button key={o} onClick={() => set(f.key, o)} className={`px-4 h-11 rounded-xl text-sm font-semibold ring-1 ${values[f.key] === o ? "bg-earth text-primary-foreground ring-earth" : "bg-card text-ink ring-border"}`}>
                    {o}
                  </button>
                ))}
              </div>
            ) : (
              <input
                value={values[f.key] ?? ""}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                type={f.type === "date" ? "date" : f.type === "tel" ? "tel" : "text"}
                inputMode={f.type === "tel" ? "numeric" : undefined}
                className="mt-2 w-full h-14 px-4 rounded-2xl bg-card ring-1 ring-border text-[16px] text-ink outline-none focus:ring-2 focus:ring-earth"
              />
            )}
          </div>
        ))}

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button onClick={() => setPhoto(true)} className={`h-16 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm ring-1 ${photo ? "bg-verified/12 text-verified ring-verified/40" : "bg-card text-ink ring-border"}`}>
            {photo ? <Check className="size-5" /> : <Camera className="size-5 text-earth" />} {photo ? "Photo added" : "Add photo"}
          </button>
          <button className="h-16 rounded-2xl bg-card ring-1 ring-border flex items-center justify-center gap-2 font-semibold text-sm text-ink">
            <Mic className="size-5 text-earth" /> Speak instead
          </button>
        </div>

        <p className="text-xs text-ink-soft leading-snug pt-1">
          Photo and extra details like timings, poojas and address can be added after saving.
        </p>
      </div>

      <div className="p-4 bg-card border-t border-border shrink-0">
        <button
          disabled={!ready}
          onClick={() => onSave(values.name ?? "Untitled", values.place ?? "Kerala")}
          className="w-full h-16 rounded-2xl bg-earth text-primary-foreground font-bold text-lg shadow-soft disabled:opacity-40"
        >
          Save
        </button>
      </div>
    </div>
  );
}

/* ---------------- SAVED CONFIRMATION ---------------- */
function SavedCard({ item, onDone, onMore }: { item: Submission; onDone: () => void; onMore: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-cream">
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
        <div className="size-24 rounded-full bg-verified/15 grid place-items-center">
          <Check className="size-12 text-verified" strokeWidth={3} />
        </div>
        <h2 className="mt-5 font-serif text-2xl font-bold text-ink">Saved successfully</h2>
        <p className="text-sm text-earth font-semibold mt-1">സേവിച്ചു 🙏</p>
        <p className="text-sm text-ink-soft mt-3 max-w-[280px]">
          <span className="font-semibold text-ink">{item.name}</span> is submitted for verification. Our team will review it soon.
        </p>

        <div className="mt-6 w-full p-4 rounded-2xl bg-card ring-1 ring-border text-left">
          <div className="font-semibold text-ink text-sm">Want to make it complete?</div>
          <p className="text-xs text-ink-soft mt-1">Add timings, poojas, photos and address — guided step by step. You can also do it later from My Submissions.</p>
          <button onClick={onMore} className="mt-3 w-full h-14 rounded-2xl bg-earth text-primary-foreground font-bold flex items-center justify-center gap-2">
            <Sparkles className="size-5" /> Add more details
          </button>
        </div>
      </div>
      <div className="p-4 bg-card border-t border-border shrink-0">
        <button onClick={onDone} className="w-full h-14 rounded-2xl bg-muted text-ink font-bold">Done for now</button>
      </div>
    </div>
  );
}
