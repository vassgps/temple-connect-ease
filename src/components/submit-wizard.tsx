import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Landmark, CalendarDays, Wrench, MapPin, Store, ShoppingBag, FilePlus2,
  Camera, Check, ChevronRight, ArrowLeft, Loader2, Inbox, Phone, Info, Sparkles,
} from "lucide-react";
import {
  listingApi, listOf, errorText,
  type ListingType, type Submission,
} from "@/lib/api";

/* ================= listing types ================= */
type Kind = ListingType;

const kinds: { key: Kind; label: string; sub: string; icon: typeof Landmark; cls: string }[] = [
  { key: "temples", label: "Add Temple", sub: "Temple, shrine, kavu", icon: Landmark, cls: "from-earth/20 to-gold/15 ring-earth/25" },
  { key: "festivals", label: "Add Festival / Event", sub: "Utsavam, pooja days, events", icon: CalendarDays, cls: "from-gold/25 to-earth/10 ring-gold/30" },
  { key: "services", label: "Add Service", sub: "Priest, flowers, sound, catering", icon: Wrench, cls: "from-verified/20 to-earth/10 ring-verified/25" },
  { key: "holyplaces", label: "Add Holy Place", sub: "Sacred pond, hill, tree, theertham", icon: MapPin, cls: "from-earth/15 to-verified/10 ring-earth/20" },
  { key: "local_business", label: "Add Local Business", sub: "Any nearby business", icon: Store, cls: "from-gold/20 to-verified/10 ring-gold/25" },
  { key: "shop_vendor", label: "Add Shop / Vendor", sub: "Pooja items, prasadam, stalls", icon: ShoppingBag, cls: "from-earth/18 to-gold/12 ring-earth/22" },
  { key: "other", label: "Add Other Listing", sub: "Anything else useful for devotees", icon: FilePlus2, cls: "from-muted to-muted ring-border" },
];

const kindLabel = (k: Kind) => kinds.find((x) => x.key === k)?.label.replace("Add ", "") ?? "Listing";
const kindIcon = (k: Kind) => kinds.find((x) => x.key === k)?.icon ?? FilePlus2;

/* ================= field model ================= */
type F = { key: string; label: string; ph?: string; type?: "text" | "tel" | "date" | "area" | "email" | "url"; req?: boolean };

function step1(kind: Kind): F[] {
  const base: F[] = [
    { key: "title", label: kind === "festivals" ? "Festival / Event name" : kind === "services" ? "Service / Shop name" : "Name", ph: "Enter name", req: true },
    { key: "subtitle", label: "Subtitle", ph: "Short one line (optional)" },
    { key: "description", label: "Description", ph: "Tell us about it (optional)", type: "area" },
    { key: "category", label: "Category", ph: "e.g. Devi temple, Priest service" },
  ];
  if (kind === "temples") base.splice(1, 0, { key: "main_deity", label: "Main deity", ph: "e.g. Bhagavathy" });
  if (kind === "festivals") base.splice(1, 0, { key: "festival_name", label: "Festival name", ph: "e.g. Thira Utsavam" });
  return base;
}

const step2: F[] = [
  { key: "location", label: "Place / Locality", ph: "Village or town" },
  { key: "address", label: "Address", ph: "Door no, street, landmark", type: "area" },
  { key: "city", label: "City / District", ph: "District" },
  { key: "state", label: "State", ph: "State" },
  { key: "country", label: "Country", ph: "India" },
  { key: "pincode", label: "Pincode", ph: "6-digit pincode" },
  { key: "map_url", label: "Google Maps link", ph: "https://maps.app.goo.gl/…", type: "url" },
  { key: "latitude", label: "Latitude", ph: "Optional" },
  { key: "longitude", label: "Longitude", ph: "Optional" },
];

const step3: F[] = [
  { key: "contact_number", label: "Contact number", ph: "10-digit number", type: "tel", req: true },
  { key: "whatsapp_number", label: "WhatsApp number", ph: "Same as contact number", type: "tel" },
  { key: "email", label: "Email", ph: "name@example.com", type: "email" },
  { key: "website", label: "Website", ph: "https://…", type: "url" },
  { key: "designated_person", label: "Contact person", ph: "Name" },
  { key: "designation", label: "Designation", ph: "e.g. Secretary" },
  { key: "phone_number", label: "Alternate phone", ph: "Landline / other number", type: "tel" },
];

function step4(kind: Kind): F[] {
  const timings: F[] = [
    { key: "morning", label: "Morning timings", ph: "e.g. 5:00 AM - 9:00 AM" },
    { key: "midday", label: "Midday timings", ph: "e.g. 11:30 AM - 12:30 PM" },
    { key: "evening", label: "Evening timings", ph: "e.g. 5:00 PM - 7:30 PM" },
    { key: "night", label: "Night timings", ph: "e.g. 7:30 PM - 8:30 PM" },
  ];
  if (kind === "temples")
    return [
      { key: "main_deity", label: "Main deity", ph: "e.g. Bhagavathy" },
      { key: "other_deities", label: "Other deities", ph: "Comma separated" },
      ...timings,
      { key: "management_type", label: "Management type", ph: "Devaswom / Trust / Family" },
      { key: "story", label: "Story", type: "area" },
      { key: "history", label: "History", type: "area" },
      { key: "speciality", label: "Speciality", type: "area" },
      { key: "dress_code", label: "Dress code", ph: "e.g. Mundu for men" },
      { key: "thanthri", label: "Thanthri", ph: "Name" },
      { key: "remarks", label: "Remarks", type: "area" },
    ];
  if (kind === "festivals")
    return [
      { key: "festival_name", label: "Festival name", ph: "Festival name" },
      { key: "start_date", label: "Start date", type: "date" },
      { key: "end_date", label: "End date", type: "date" },
      { key: "story", label: "Story", type: "area" },
      { key: "history", label: "History", type: "area" },
      { key: "speciality", label: "Speciality", type: "area" },
      { key: "remarks", label: "Remarks", type: "area" },
    ];
  if (kind === "services")
    return [...timings, { key: "story", label: "About the service", type: "area" }, { key: "remarks", label: "Remarks", type: "area" }];
  if (kind === "holyplaces")
    return [{ key: "story", label: "Story", type: "area" }, { key: "history", label: "History", type: "area" }];
  return [
    { key: "description", label: "Description", type: "area" },
    { key: "speciality", label: "Speciality", type: "area" },
    { key: "opening_hours", label: "Timings / Opening hours", ph: "e.g. Mon-Sat 9 AM - 8 PM", type: "area" },
    { key: "remarks", label: "Remarks", type: "area" },
  ];
}

const stepTitles = ["Basic Details", "Location", "Contact", "Extra Details"];
const tap = "active:scale-[0.98] active:bg-orange-50 transition-all duration-150";

/* ================= payload ================= */
function buildForm(kind: Kind, v: Record<string, string>, photo: File | null, listingUuid?: string) {
  const form = new FormData();
  form.append("listing_type", kind);
  if (listingUuid) form.append("listing_uuid", listingUuid);
  form.append("language", "en");
  const wa = (v.whatsapp_number ?? "").trim() || (v.contact_number ?? "").trim();
  const all: Record<string, string> = { ...v, whatsapp_number: wa, name: v.title ?? "" };
  for (const [k, raw] of Object.entries(all)) {
    const val = (raw ?? "").trim();
    if (!val || k === "listing_type") continue;
    form.append(k, val);
  }
  if (photo) form.append("image", photo);
  return form;
}

/* ================= SUBMIT TAB ================= */
export function SubmitScreen({ logoMark }: { logoMark: string }) {
  const [wizard, setWizard] = useState<{ kind: Kind; prefill?: Record<string, string>; uuid?: string } | null>(null);

  const listQ = useQuery({ queryKey: ["my-submissions"], queryFn: listingApi.mySubmissions, retry: false });
  const items = listOf<Submission>(listQ.data);

  if (wizard)
    return (
      <Wizard
        kind={wizard.kind}
        prefill={wizard.prefill}
        listingUuid={wizard.uuid}
        back={() => setWizard(null)}
      />
    );

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <header className="px-5 pt-3 pb-4 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <img src={logoMark} alt="" className="size-9" />
          <span className="font-serif text-xl font-bold text-earth">Submit Details</span>
        </div>
        <p className="text-sm text-ink-soft mt-2 leading-snug">
          Choose what you want to add. Simple forms, 4 short steps.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-3">
          {kinds.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.key}
                onClick={() => setWizard({ kind: m.key })}
                className={`w-full p-4 rounded-3xl bg-gradient-to-br ${m.cls} ring-1 flex items-center gap-4 text-left ${tap}`}
              >
                <div className="size-14 rounded-2xl bg-card grid place-items-center shadow-soft shrink-0">
                  <Icon className="size-7 text-earth" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-lg font-bold text-ink">{m.label}</div>
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
            <div className="py-8 flex flex-col items-center gap-2 text-ink-soft">
              <Loader2 className="size-5 animate-spin text-earth" /><span className="text-xs">Loading your submissions…</span>
            </div>
          )}
          {listQ.isError && (
            <div className="p-4 rounded-2xl bg-card ring-1 ring-border text-center">
              <div className="text-sm font-semibold text-ink">Submissions unavailable</div>
              <p className="text-xs text-ink-soft mt-1">{errorText(listQ.error)}</p>
              <button onClick={() => listQ.refetch()} className={`mt-3 h-10 px-4 rounded-full bg-earth text-primary-foreground text-xs font-bold ${tap}`}>Try again</button>
            </div>
          )}
          {!listQ.isLoading && !listQ.isError && items.length === 0 && (
            <div className="py-10 flex flex-col items-center text-center gap-2">
              <div className="size-14 rounded-2xl bg-muted grid place-items-center"><Inbox className="size-6 text-ink-soft" /></div>
              <div className="font-semibold text-ink">No submissions yet</div>
              <p className="text-xs text-ink-soft max-w-[260px]">Anything you add above will show here with its verification status.</p>
            </div>
          )}

          {items.map((it, i) => (
            <SubmissionRow
              key={it.uuid ?? it.id ?? i}
              item={it}
              onOpen={() => setWizard({ kind: (it.listing_type ?? "other") as Kind, prefill: prefillOf(it), uuid: it.uuid })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function prefillOf(it: Submission): Record<string, string> {
  const d = (it.data ?? {}) as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(d)) {
    if (typeof v === "string" || typeof v === "number") out[k] = String(v);
  }
  out.title = it.title ?? it.name ?? out.title ?? "";
  if (it.city) out.city = it.city;
  if (it.location) out.location = it.location;
  return out;
}

function statusStyle(status: string) {
  const s = status.toLowerCase();
  if (s === "verified" || s === "approved") return "bg-verified/12 text-verified ring-verified/30";
  if (s === "rejected") return "bg-destructive/10 text-destructive ring-destructive/30";
  if (s === "draft") return "bg-muted text-ink-soft ring-border";
  return "bg-gold/15 text-earth ring-gold/30";
}

function SubmissionRow({ item, onOpen }: { item: Submission; onOpen: () => void }) {
  const Icon = kindIcon((item.listing_type ?? "other") as Kind);
  const status = (item.status ?? "pending").toLowerCase();
  return (
    <div className="p-4 rounded-2xl bg-card ring-1 ring-border">
      <div className="flex items-center gap-3">
        <div className="size-11 rounded-xl bg-earth-soft grid place-items-center shrink-0">
          <Icon className="size-5 text-earth" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-ink truncate">{item.title ?? item.name ?? "Untitled listing"}</div>
          <div className="text-xs text-ink-soft truncate">
            {kindLabel((item.listing_type ?? "other") as Kind)}
            {item.city || item.location ? ` · ${item.location ?? item.city}` : ""}
          </div>
        </div>
        <span className={`px-2.5 h-7 grid place-items-center rounded-full text-[11px] font-bold ring-1 capitalize ${statusStyle(status)}`}>
          {status}
        </span>
      </div>
      <button onClick={onOpen} className={`mt-3 w-full h-12 rounded-xl bg-earth-soft text-earth font-bold text-sm flex items-center justify-center gap-2 ${tap}`}>
        <Sparkles className="size-4" /> Add more details
      </button>
    </div>
  );
}

/* ================= WIZARD ================= */
function Wizard({ kind, prefill, listingUuid, back }: {
  kind: Kind; prefill?: Record<string, string>; listingUuid?: string; back: () => void;
}) {
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({ country: "India", ...(prefill ?? {}) });
  const [photo, setPhoto] = useState<File | null>(null);
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState<Submission | null>(null);

  const stepFields = useMemo<F[][]>(() => [step1(kind), step2, step3, step4(kind)], [kind]);
  const fields = stepFields[step];
  const set = (k: string, v: string) => setValues((p) => ({ ...p, [k]: v }));

  const missing = fields.filter((f) => f.req && !(values[f.key] ?? "").trim());

  const submit = useMutation({
    mutationFn: (draft: boolean) =>
      listingApi.createForm(buildForm(kind, draft ? { ...values, status: "draft" } : values, photo, listingUuid)),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["my-submissions"] });
      const d = (data ?? {}) as Submission;
      setDone({ ...d, title: d.title ?? values.title, listing_type: kind });
    },
  });

  if (done) return <SuccessCard item={done} onDone={back} />;

  const next = () => {
    setTouched(true);
    if (missing.length) return;
    setTouched(false);
    if (step < 3) setStep(step + 1);
    else submit.mutate(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-cream">
      <header className="px-3 py-3 bg-card border-b border-border flex items-center gap-2 shrink-0">
        <button onClick={() => (step === 0 ? back() : setStep(step - 1))} className={`size-10 rounded-full grid place-items-center ${tap}`}>
          <ArrowLeft className="size-5 text-ink" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-serif text-lg font-bold text-ink truncate">
            {listingUuid ? `Update ${kindLabel(kind)}` : `Add ${kindLabel(kind)}`}
          </div>
          <div className="text-xs text-earth font-semibold">Step {step + 1} of 4 · {stepTitles[step]}</div>
        </div>
      </header>

      <div className="px-4 pt-3 shrink-0">
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-earth transition-all duration-300" style={{ width: `${((step + 1) / 4) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {fields.map((f) => (
          <Field key={f.key} f={f} value={values[f.key] ?? ""} onChange={(v) => set(f.key, v)} invalid={touched && Boolean(f.req) && !(values[f.key] ?? "").trim()} />
        ))}

        {step === 0 && (
          <label className={`h-16 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm ring-1 cursor-pointer ${photo ? "bg-verified/12 text-verified ring-verified/40" : "bg-card text-ink ring-border"} ${tap}`}>
            {photo ? <Check className="size-5" /> : <Camera className="size-5 text-earth" />}
            {photo ? photo.name.slice(0, 24) : "Add photo (optional)"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
          </label>
        )}

        {step === 2 && (
          <p className="text-xs text-ink-soft flex items-start gap-2">
            <Phone className="size-4 text-earth shrink-0 mt-0.5" />
            WhatsApp number is taken as the contact number if you leave it empty.
          </p>
        )}

        {touched && missing.length > 0 && (
          <p className="text-sm text-destructive">Please fill: {missing.map((m) => m.label).join(", ")}</p>
        )}
        {submit.isError && <p className="text-sm text-destructive">{errorText(submit.error)}</p>}
        {step === 3 && (
          <p className="text-xs text-ink-soft flex items-start gap-2">
            <Info className="size-4 text-earth shrink-0 mt-0.5" />
            All fields on this step are optional — submit whatever you know.
          </p>
        )}
      </div>

      <div className="p-3 bg-card border-t border-border shrink-0 flex items-center gap-2">
        <button
          onClick={() => (step === 0 ? back() : setStep(step - 1))}
          className={`h-14 px-5 rounded-2xl bg-muted text-ink font-bold ${tap}`}
        >
          Back
        </button>
        <button
          disabled={submit.isPending}
          onClick={() => { setTouched(true); if (!(values.title ?? "").trim()) { setStep(0); return; } submit.mutate(true); }}
          className={`h-14 px-4 rounded-2xl bg-card ring-1 ring-border text-earth font-bold text-sm ${tap}`}
        >
          Save Draft
        </button>
        <button
          disabled={submit.isPending}
          onClick={next}
          className={`flex-1 h-14 rounded-2xl bg-earth text-primary-foreground font-bold text-lg shadow-soft disabled:opacity-40 flex items-center justify-center gap-2 ${tap}`}
        >
          {submit.isPending && <Loader2 className="size-5 animate-spin" />}
          {step === 3 ? "Submit" : "Continue"}
        </button>
      </div>
    </div>
  );
}

function Field({ f, value, onChange, invalid }: { f: F; value: string; onChange: (v: string) => void; invalid: boolean }) {
  const cls = `mt-2 w-full px-4 rounded-2xl bg-card ring-1 text-[16px] text-ink outline-none focus:ring-2 focus:ring-earth ${invalid ? "ring-destructive" : "ring-border"}`;
  return (
    <div>
      <label className="text-sm font-bold text-ink">
        {f.label} {f.req && <span className="text-destructive">*</span>}
      </label>
      {f.type === "area" ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={f.ph} rows={3} className={`${cls} py-3 resize-none`} />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(f.type === "tel" ? e.target.value.replace(/\D/g, "").slice(0, 12) : e.target.value)}
          placeholder={f.ph}
          type={f.type === "date" ? "date" : f.type === "email" ? "email" : f.type === "url" ? "url" : f.type === "tel" ? "tel" : "text"}
          inputMode={f.type === "tel" ? "numeric" : undefined}
          className={`${cls} h-14`}
        />
      )}
    </div>
  );
}

/* ================= SUCCESS ================= */
function SuccessCard({ item, onDone }: { item: Submission; onDone: () => void }) {
  const status = (item.status ?? "pending").toLowerCase();
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-cream">
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
        <div className="size-24 rounded-full bg-verified/15 grid place-items-center">
          <Check className="size-12 text-verified" strokeWidth={3} />
        </div>
        <h2 className="mt-5 font-serif text-2xl font-bold text-ink">Submitted successfully</h2>
        <div className="mt-5 w-full p-4 rounded-2xl bg-card ring-1 ring-border text-left space-y-2">
          <div className="font-semibold text-ink">{item.title ?? "Your listing"}</div>
          {item.code && <div className="text-xs text-ink-soft">Listing code: <span className="font-mono font-semibold text-ink">{item.code}</span></div>}
          <span className={`inline-grid px-2.5 h-7 place-items-center rounded-full text-[11px] font-bold ring-1 capitalize ${statusStyle(status)}`}>{status}</span>
          <p className="text-xs text-ink-soft">You can see it any time under My Submissions.</p>
        </div>
      </div>
      <div className="p-4 bg-card border-t border-border shrink-0">
        <button onClick={onDone} className={`w-full h-14 rounded-2xl bg-earth text-primary-foreground font-bold ${tap}`}>Done</button>
      </div>
    </div>
  );
}
