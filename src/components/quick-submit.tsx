import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Landmark, CalendarDays, Wrench, MapPin, Camera, Check, ChevronRight,
  ArrowLeft, Mic, Sparkles, ShieldCheck, Clock, Loader2, Inbox,
} from "lucide-react";
import {
  catalogApi, listingApi, listOf, errorText,
  type Deity, type ListingType, type Submission,
} from "@/lib/api";

export type SubmitKind = "temple" | "festival" | "service";

type Field = {
  key: string;
  label: string;
  ml?: string;
  placeholder: string;
  type?: "text" | "tel" | "date" | "choice";
  source?: "deities" | "service-categories";
};

const kindMeta: Record<SubmitKind, { title: string; ml: string; sub: string; icon: typeof Landmark; cls: string; listingType: ListingType; fields: Field[] }> = {
  temple: {
    title: "Add Temple", ml: "ക്ഷേത്രം ചേർക്കുക", sub: "Name, place, deity — 1 minute",
    icon: Landmark, cls: "from-earth/20 to-gold/15 ring-earth/25", listingType: "temples",
    fields: [
      { key: "name", label: "Temple name", ml: "ക്ഷേത്രത്തിന്റെ പേര്", placeholder: "Temple name" },
      { key: "deity", label: "Main deity", ml: "പ്രധാന ദേവൻ", placeholder: "Select deity", type: "choice", source: "deities" },
      { key: "place", label: "Village / Town", ml: "സ്ഥലം", placeholder: "Village, District" },
      { key: "phone", label: "Temple contact number", placeholder: "10-digit number", type: "tel" },
    ],
  },
  festival: {
    title: "Add Festival / Event", ml: "ഉത്സവം ചേർക്കുക", sub: "Festival name, temple, date",
    icon: CalendarDays, cls: "from-gold/25 to-earth/10 ring-gold/30", listingType: "festivals",
    fields: [
      { key: "name", label: "Festival / Event name", ml: "ഉത്സവത്തിന്റെ പേര്", placeholder: "Festival name" },
      { key: "temple", label: "Temple name", ml: "ക്ഷേത്രം", placeholder: "Temple name" },
      { key: "date", label: "Start date", ml: "തീയതി", placeholder: "", type: "date" },
      { key: "place", label: "Village / Town", placeholder: "Village, District" },
    ],
  },
  service: {
    title: "Add Service", ml: "സേവനം ചേർക്കുക", sub: "Priest, flowers, sound, catering…",
    icon: Wrench, cls: "from-verified/20 to-earth/10 ring-verified/25", listingType: "services",
    fields: [
      { key: "name", label: "Your / shop name", ml: "പേര്", placeholder: "Name" },
      { key: "category", label: "Service type", ml: "സേവനം", placeholder: "Select type", type: "choice", source: "service-categories" },
      { key: "place", label: "Service area", placeholder: "Village, District" },
      { key: "phone", label: "Mobile number", placeholder: "10-digit number", type: "tel" },
    ],
  },
};

/** Map the 4 quick-form answers onto the detailed listing-flow step keys. */
export function toPrefill(kind: SubmitKind, v: Record<string, string>): Record<string, string> {
  const p: Record<string, string> = {};
  if (v.name) p.name = v.name;
  if (v.phone) p.phone = v.phone;
  if (kind === "temple") {
    if (v.place) { p.landmark = v.place; p.city = v.place.split(",").pop()!.trim(); }
    if (v.deity) p.mainDeity = v.deity;
  }
  if (kind === "service") {
    if (v.place) p.city = v.place;
    if (v.category) p.category = v.category;
  }
  if (kind === "festival") {
    if (v.temple) p.temple = v.temple;
    if (v.date) p.start = v.date;
  }
  return p;
}

function payloadFor(kind: SubmitKind, v: Record<string, string>) {
  const meta = kindMeta[kind];
  const place = v.place ?? "";
  const city = place.split(",").pop()?.trim() ?? place;
  return {
    listing_type: meta.listingType,
    title: v.name ?? "",
    name: v.name ?? "",
    location: place,
    city,
    state: "Kerala",
    country: "India",
    contact_number: v.phone ?? "",
    whatsapp_number: v.phone ?? "",
    ...(kind === "temple" ? { main_deity: v.deity } : {}),
    ...(kind === "service" ? { category_slug: v.category } : {}),
    ...(kind === "festival" ? { start_date: v.date, description: v.temple ? `At ${v.temple}` : undefined } : {}),
  };
}

/* ---------------- MAIN SUBMIT TAB ---------------- */
export function SubmitScreen({
  logoMark, openFullFlow,
}: {
  logoMark: string;
  openFullFlow: (kind: SubmitKind, prefill?: Record<string, string>) => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<SubmitKind | null>(null);
  const [saved, setSaved] = useState<{ kind: SubmitKind; values: Record<string, string> } | null>(null);

  const listQ = useQuery({ queryKey: ["my-submissions"], queryFn: listingApi.mySubmissions, retry: false });
  const items = listOf<Submission>(listQ.data);

  const create = useMutation({
    mutationFn: (input: { kind: SubmitKind; values: Record<string, string> }) =>
      listingApi.create(payloadFor(input.kind, input.values)),
    onSuccess: (_d, input) => {
      qc.invalidateQueries({ queryKey: ["my-submissions"] });
      setForm(null);
      setSaved(input);
    },
  });

  const openMore = (it: Submission) => {
    const kind: SubmitKind = it.listing_type === "services" ? "service" : it.listing_type === "festivals" ? "festival" : "temple";
    openFullFlow(kind, toPrefill(kind, {
      name: it.title ?? it.name ?? "",
      place: it.location ?? it.city ?? "",
    }));
  };

  if (saved) {
    return (
      <SavedCard
        name={saved.values.name ?? "Your listing"}
        onDone={() => setSaved(null)}
        onMore={() => { const s = saved; setSaved(null); openFullFlow(s.kind, toPrefill(s.kind, s.values)); }}
      />
    );
  }

  if (form) {
    return (
      <QuickForm
        kind={form}
        busy={create.isPending}
        error={create.isError ? errorText(create.error) : null}
        back={() => { create.reset(); setForm(null); }}
        onSave={(values) => create.mutate({ kind: form, values })}
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
          {!listQ.isLoading && !listQ.isError && <span className="text-xs text-ink-soft">{items.length} total</span>}
        </div>

        <div className="px-4 space-y-2">
          {listQ.isLoading && (
            <div className="py-8 flex flex-col items-center gap-2 text-ink-soft"><Loader2 className="size-5 animate-spin text-earth" /><span className="text-xs">Loading your submissions…</span></div>
          )}
          {listQ.isError && (
            <div className="p-4 rounded-2xl bg-card ring-1 ring-border text-center">
              <div className="text-sm font-semibold text-ink">Submissions unavailable</div>
              <p className="text-xs text-ink-soft mt-1">{errorText(listQ.error)}</p>
              <button onClick={() => listQ.refetch()} className="mt-3 h-10 px-4 rounded-full bg-earth text-primary-foreground text-xs font-bold">Try again</button>
            </div>
          )}
          {!listQ.isLoading && !listQ.isError && items.length === 0 && (
            <div className="py-10 flex flex-col items-center text-center gap-2">
              <div className="size-14 rounded-2xl bg-muted grid place-items-center"><Inbox className="size-6 text-ink-soft" /></div>
              <div className="font-semibold text-ink">No submissions yet</div>
              <p className="text-xs text-ink-soft max-w-[260px]">Add a temple, festival or service above and it will show here with its verification status.</p>
            </div>
          )}

          {items.map((it, i) => {
            const kind: SubmitKind = it.listing_type === "services" ? "service" : it.listing_type === "festivals" ? "festival" : "temple";
            const Icon = kindMeta[kind].icon;
            const verified = (it.status ?? "").toLowerCase() === "verified" || (it.status ?? "").toLowerCase() === "approved";
            const completeness = typeof it.completeness === "number" ? it.completeness : null;
            return (
              <div key={it.uuid ?? it.id ?? i} className="p-4 rounded-2xl bg-card ring-1 ring-border">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-earth-soft grid place-items-center shrink-0"><Icon className="size-5 text-earth" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink text-sm truncate">{it.title ?? it.name ?? "Untitled listing"}</div>
                    <div className="text-xs text-ink-soft flex items-center gap-1 truncate"><MapPin className="size-3 shrink-0" />{it.location ?? it.city ?? "—"}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase shrink-0 ${verified ? "bg-verified/15 text-verified" : "bg-gold/25 text-earth"}`}>
                    {verified
                      ? <span className="flex items-center gap-1"><ShieldCheck className="size-3" />verified</span>
                      : <span className="flex items-center gap-1"><Clock className="size-3" />{it.status ?? "pending"}</span>}
                  </span>
                </div>
                {completeness !== null && completeness < 100 && (
                  <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-earth rounded-full" style={{ width: `${completeness}%` }} />
                  </div>
                )}
                <button onClick={() => openMore(it)} className="mt-3 w-full h-11 rounded-xl bg-earth-soft text-earth font-bold text-sm flex items-center justify-center gap-2">
                  <Sparkles className="size-4" /> Add more details{completeness !== null ? ` (${completeness}% complete)` : ""}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------- QUICK FORM (4 fields) ---------------- */
function QuickForm({ kind, back, onSave, busy, error }: {
  kind: SubmitKind; back: () => void; onSave: (values: Record<string, string>) => void; busy: boolean; error: string | null;
}) {
  const meta = kindMeta[kind];
  const [values, setValues] = useState<Record<string, string>>({});
  const [photo, setPhoto] = useState(false);
  const set = (k: string, v: string) => setValues((p) => ({ ...p, [k]: v }));

  const deitiesQ = useQuery({
    queryKey: ["deities"], queryFn: catalogApi.deities,
    enabled: meta.fields.some((f) => f.source === "deities"),
  });
  const catsQ = useQuery({
    queryKey: ["categories", "services"], queryFn: () => catalogApi.categories("services"),
    enabled: meta.fields.some((f) => f.source === "service-categories"),
  });

  const options = useMemo(() => ({
    deities: listOf<Deity>(deitiesQ.data).map((d) => d.name),
    "service-categories": listOf<{ name: string }>(catsQ.data).map((c) => c.name),
  }), [deitiesQ.data, catsQ.data]);

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
        {meta.fields.map((f) => {
          const opts = f.source ? options[f.source] : [];
          return (
            <div key={f.key}>
              <label className="text-sm font-bold text-ink">
                {f.label} <span className="text-destructive">*</span>
                {f.ml && <span className="block text-xs font-semibold text-earth mt-0.5">{f.ml}</span>}
              </label>
              {f.type === "choice" ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {(deitiesQ.isLoading || catsQ.isLoading) && opts.length === 0 && (
                    <span className="text-xs text-ink-soft flex items-center gap-1"><Loader2 className="size-3 animate-spin" /> Loading options…</span>
                  )}
                  {opts.length === 0 && !deitiesQ.isLoading && !catsQ.isLoading && (
                    <input
                      value={values[f.key] ?? ""}
                      onChange={(e) => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full h-14 px-4 rounded-2xl bg-card ring-1 ring-border text-[16px] text-ink outline-none focus:ring-2 focus:ring-earth"
                    />
                  )}
                  {opts.map((o) => (
                    <button key={o} onClick={() => set(f.key, o)} className={`px-4 h-11 rounded-xl text-sm font-semibold ring-1 ${values[f.key] === o ? "bg-earth text-primary-foreground ring-earth" : "bg-card text-ink ring-border"}`}>
                      {o}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  value={values[f.key] ?? ""}
                  onChange={(e) => set(f.key, f.type === "tel" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value)}
                  placeholder={f.placeholder}
                  type={f.type === "date" ? "date" : f.type === "tel" ? "tel" : "text"}
                  inputMode={f.type === "tel" ? "numeric" : undefined}
                  className="mt-2 w-full h-14 px-4 rounded-2xl bg-card ring-1 ring-border text-[16px] text-ink outline-none focus:ring-2 focus:ring-earth"
                />
              )}
            </div>
          );
        })}

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button onClick={() => setPhoto(true)} className={`h-16 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm ring-1 ${photo ? "bg-verified/12 text-verified ring-verified/40" : "bg-card text-ink ring-border"}`}>
            {photo ? <Check className="size-5" /> : <Camera className="size-5 text-earth" />} {photo ? "Photo added" : "Add photo"}
          </button>
          <button className="h-16 rounded-2xl bg-card ring-1 ring-border flex items-center justify-center gap-2 font-semibold text-sm text-ink">
            <Mic className="size-5 text-earth" /> Speak instead
          </button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <p className="text-xs text-ink-soft leading-snug pt-1">
          Photo and extra details like timings, poojas and address can be added after saving.
        </p>
      </div>

      <div className="p-4 bg-card border-t border-border shrink-0">
        <button
          disabled={!ready || busy}
          onClick={() => onSave(values)}
          className="w-full h-16 rounded-2xl bg-earth text-primary-foreground font-bold text-lg shadow-soft disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {busy && <Loader2 className="size-5 animate-spin" />} Save
        </button>
      </div>
    </div>
  );
}

/* ---------------- SAVED CONFIRMATION ---------------- */
function SavedCard({ name, onDone, onMore }: { name: string; onDone: () => void; onMore: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-cream">
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
        <div className="size-24 rounded-full bg-verified/15 grid place-items-center">
          <Check className="size-12 text-verified" strokeWidth={3} />
        </div>
        <h2 className="mt-5 font-serif text-2xl font-bold text-ink">Saved successfully</h2>
        <p className="text-sm text-earth font-semibold mt-1">സേവിച്ചു 🙏</p>
        <p className="text-sm text-ink-soft mt-3 max-w-[280px]">
          <span className="font-semibold text-ink">{name}</span> is submitted for verification. Our team will review it soon.
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
