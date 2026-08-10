/**
 * TempleAddress API client.
 * All screens read live data from the backend — there is no mock/fallback data.
 * Responses are wrapped as { success, message, data }; lists live in data.results.
 */

export const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://dev.templeaddress.com";

const env = import.meta.env as Record<string, string | undefined>;
/** Accept every naming variant so the key works wherever it was configured. */
const RECAPTCHA_SITE_KEY =
  env.VITE_RECAPTCHA_SITE_KEY ||
  env.VITE_USER_RECAPTCHA_SITE_KEY ||
  env.VITE_USER_RECAPTCHA_PUBLIC_KEY ||
  env.USER_RECAPTCHA_PUBLIC_KEY ||
  undefined;

const ACCESS_KEY = "ta_access";
const REFRESH_KEY = "ta_refresh";

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

/* ---------------- token store ---------------- */
export const tokens = {
  access(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACCESS_KEY);
  },
  refresh(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_KEY);
  },
  save(access?: string | null, refresh?: string | null) {
    if (typeof window === "undefined") return;
    if (access) window.localStorage.setItem(ACCESS_KEY, access);
    if (refresh) window.localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
};

/* ---------------- reCAPTCHA (v2 checkbox) ---------------- */
declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark";
          size?: "normal" | "compact";
        },
      ) => number;
      reset: (widgetId?: number) => void;
      getResponse: (widgetId?: number) => string;
    };
  }
}

let recaptchaLoader: Promise<boolean> | null = null;

/** Loads Google's v2 script once. Resolves false instead of throwing so the UI never hard-fails. */
export function loadRecaptcha(siteKey = RECAPTCHA_SITE_KEY): Promise<boolean> {
  if (typeof window === "undefined" || !siteKey) return Promise.resolve(false);
  if (recaptchaLoader) return recaptchaLoader;
  recaptchaLoader = new Promise<boolean>((resolve) => {
    if (window.grecaptcha?.render) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>('script[data-recaptcha="1"]');
    const s = existing ?? document.createElement("script");
    s.dataset.recaptcha = "1";
    s.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    s.async = true;
    s.defer = true;
    const done = () => resolve(Boolean(window.grecaptcha?.render));
    const timer = window.setTimeout(() => {
      console.warn("[recaptcha] script load timed out (network blocked or ad-blocker?)");
      done();
    }, 10000);
    s.onload = () => {
      window.clearTimeout(timer);
      window.grecaptcha?.ready ? window.grecaptcha.ready(done) : done();
    };
    s.onerror = () => {
      window.clearTimeout(timer);
      console.error("[recaptcha] failed to load https://www.google.com/recaptcha/api.js");
      resolve(false);
    };
    if (!existing) document.head.appendChild(s);
  });
  return recaptchaLoader;
}

export const recaptchaConfigured = Boolean(RECAPTCHA_SITE_KEY);
export const recaptchaSiteKey = RECAPTCHA_SITE_KEY;

/** Warm up the script so the checkbox renders instantly. */
export function primeRecaptcha() {
  void loadRecaptcha();
}



/* ---------------- core request ---------------- */
type Req = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  form?: FormData;
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined | null>;
};

function buildUrl(path: string, query?: Req["query"]) {
  const url = new URL(path.startsWith("http") ? path : `${API_BASE}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

function unwrap(json: unknown, status: number) {
  if (json && typeof json === "object" && "success" in json) {
    const j = json as { success: boolean; message?: string; data?: unknown };
    if (!j.success) throw new ApiError(readMessage(j) || "Request failed", status, j.data);
    return j.data;
  }
  return json;
}

function readMessage(j: { message?: string; data?: unknown }): string {
  const d = j.data as { errors?: Record<string, string[]> } | undefined;
  if (d?.errors) {
    const first = Object.values(d.errors)[0];
    if (Array.isArray(first) && first[0]) return first[0];
  }
  return (j.message ?? "").replace(/ErrorDetail\(string='|', code='[a-z_]+'\)/g, "");
}

async function raw(path: string, opts: Req, retry = true): Promise<unknown> {
  const { method = "GET", body, form, auth, query } = opts;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (auth) {
    const t = tokens.access();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });

  if (res.status === 401 && auth && retry && (await tryRefresh())) {
    return raw(path, opts, false);
  }

  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new ApiError(
      res.status === 404 ? "This feature is not available on the server yet." : "Unexpected server response",
      res.status,
    );
  }
  if (!res.ok && (!json || typeof json !== "object" || !("success" in json))) {
    throw new ApiError(`Request failed (${res.status})`, res.status, json);
  }
  return unwrap(json, res.status);
}

async function tryRefresh() {
  const refresh = tokens.refresh();
  if (!refresh) return false;
  try {
    const data = (await raw("/api/v1/users/token/refresh/", { method: "POST", body: { refresh } }, false)) as
      | { access?: string; access_token?: string }
      | null;
    const access = data?.access ?? data?.access_token;
    if (!access) return false;
    tokens.save(access);
    return true;
  } catch {
    tokens.clear();
    return false;
  }
}

export const api = {
  get: (path: string, query?: Req["query"], auth = true) => raw(path, { query, auth }),
  post: (path: string, body?: unknown, auth = true) => raw(path, { method: "POST", body, auth }),
  put: (path: string, body?: unknown, auth = true) => raw(path, { method: "PUT", body, auth }),
  patch: (path: string, body?: unknown, auth = true) => raw(path, { method: "PATCH", body, auth }),
  del: (path: string, auth = true) => raw(path, { method: "DELETE", auth }),
  postForm: (path: string, form: FormData, auth = true) => raw(path, { method: "POST", form, auth }),
  patchForm: (path: string, form: FormData, auth = true) => raw(path, { method: "PATCH", form, auth }),
};

export function listOf<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const d = data as { results?: T[]; threads?: T[]; items?: T[] } | null;
  return d?.results ?? d?.threads ?? d?.items ?? [];
}

export function countOf(data: unknown): number {
  const d = data as { count?: number; results?: unknown[] } | null;
  return d?.count ?? d?.results?.length ?? 0;
}

/* ================= types ================= */
export type ListingType =
  | "temples"
  | "services"
  | "festivals"
  | "holyplaces"
  | "local_business"
  | "shop_vendor"
  | "other";

export type Listing = {
  id: number;
  uuid: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  listing_type: ListingType;
  category_name?: string | null;
  image?: string | null;
  location?: string | null;
  address?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  code?: string | null;
  pooja_count?: number;
  allow_booking?: boolean;
  ownership_verified?: boolean;
  is_featured?: boolean;
  distance_km?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  map_url?: string | null;
  contact_details?: Record<string, string> | null;
  info?: ListingInfo | null;
};

export type Deity = { id: number; uuid: string; name: string; slug: string; image?: string | null };

export type Pooja = {
  id: number;
  uuid: string;
  name: string;
  description?: string | null;
  rate: string;
  is_active?: boolean;
  start_time?: string | null;
  end_time?: string | null;
  available_from?: string | null;
  available_to?: string | null;
  display_image?: string | null;
  pooja_category_detail?: { name?: string } | null;
};

export type ListingInfo = {
  main_deity?: Deity | null;
  other_deities?: Deity[];
  pooja_list?: Pooja[];
  morning_opening_time?: string | null;
  morning_closing_time?: string | null;
  evening_opening_time?: string | null;
  evening_closing_time?: string | null;
  story?: string | null;
  history?: string | null;
} & Record<string, unknown>;

export type Me = {
  uuid?: string;
  name?: string;
  full_name?: string;
  mobile_number?: string;
  country_code?: string;
  email?: string | null;
  is_agent?: boolean;
  referral_code?: string | null;
};

export type Notification = {
  id?: number;
  uuid?: string;
  title?: string;
  message?: string;
  body?: string;
  created_at?: string;
  is_read?: boolean;
};

/** A temple/system notification thread shown in the inbox. */
export type NotificationThread = {
  id?: number | string;
  thread_id?: number | string;
  uuid?: string;
  title?: string;
  name?: string;
  temple_name?: string;
  listing_title?: string;
  subtitle?: string | null;
  type?: string;
  listing_uuid?: string;
  image?: string | null;
  temple_image?: string | null;
  avatar?: string | null;
  avatar_url?: string | null;
  latest_message?: string | null;
  last_message?: string | null;
  latest_notification?: string | { message?: string; body?: string; title?: string; created_at?: string } | null;
  latest_at?: string | null;
  latest_time?: string | null;
  last_message_at?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  unread_count?: number;
  unread?: number;
};

export type NotificationThreadDetail = NotificationThread & {
  notifications?: Notification[];
  messages?: Notification[];
  results?: Notification[];
};


export type Booking = {
  uuid?: string;
  booking_code?: string;
  status?: string;
  total_amount?: string | number;
  booking_date?: string;
  pooja_date?: string;
  created_at?: string;
  devotee_name?: string;
  listing_title?: string;
  temple_name?: string;
  items?: { name?: string; pooja_name?: string; amount?: string | number }[];
};

export type Submission = {
  uuid?: string;
  id?: number;
  title?: string;
  name?: string;
  listing_type?: ListingType;
  status?: string;
  city?: string | null;
  location?: string | null;
  completeness?: number | null;
  image?: string | null;
  data?: Record<string, unknown>;
};

/* ================= endpoints ================= */
export const authApi = {
  register: async (
    input: { name: string; mobile_number: string; country_code?: string },
    recaptcha_token?: string,
  ) =>
    api.post(
      "/api/v1/users/register/",
      { country_code: "+91", ...input, ...(recaptcha_token ? { recaptcha_token } : {}) },
      false,
    ) as Promise<{ otp_required?: boolean; recaptcha_required?: boolean; identifier?: string }>,
  login: async (identifier: string, recaptcha_token?: string) =>
    api.post(
      "/api/v1/users/login/",
      { identifier, ...(recaptcha_token ? { recaptcha_token } : {}) },
      false,
    ) as Promise<{ otp_sent?: boolean; recaptcha_required?: boolean; password_required?: boolean }>,

  verifyOtp: async (identifier: string, otp: string) => {
    const data = (await api.post("/api/v1/users/login/verify-otp/", { identifier, otp }, false)) as {
      access?: string;
      refresh?: string;
      access_token?: string;
      refresh_token?: string;
      user?: Me;
    };
    tokens.save(data?.access ?? data?.access_token, data?.refresh ?? data?.refresh_token);
    return data;
  },
  me: () => api.get("/api/v1/users/me/") as Promise<Me>,
  updateProfile: (body: Record<string, unknown>) => api.put("/api/v1/users/profile/update/", body),
  wallet: () => api.get("/api/v1/users/wallet/") as Promise<Record<string, unknown>>,
  walletTransactions: () => api.get("/api/v1/users/wallet/transactions/"),
  notifications: () => api.get("/api/v1/users/notifications/"),
  notificationThreads: () => api.get("/api/v1/users/notification-threads/"),
  notificationThread: (id: string) =>
    api.get(`/api/v1/users/notification-threads/${encodeURIComponent(id)}/`) as Promise<NotificationThreadDetail>,
  markThreadRead: (id: string) =>
    api.post(`/api/v1/users/notification-threads/${encodeURIComponent(id)}/read/`, {}),

  logout: () => tokens.clear(),
};

export const discoverApi = {
  list: (params: {
    listing_type?: ListingType;
    search?: string;
    select?: "verified_temple" | "pooja_booking";
    page?: number;
    limit?: number;
  }) =>
    api.get(
      "/api/v1/cms/discover/",
      {
        limit: params.limit ?? 20,
        page: params.page ?? 1,
        listing_type: params.listing_type,
        select: params.select,
        search: params.search,
        search_scope: params.search ? "listing_only" : undefined,
      },
      false,
    ),
  suggestions: (q: string, listing_type: ListingType = "temples") =>
    api.get("/api/v1/cms/discover/suggestions/", { q, listing_type, limit: 8 }, false),
  detail: (slug: string) => api.get(`/api/v1/cms/discover/${slug}/`, undefined, false) as Promise<Listing>,
  contacts: (slug: string) =>
    api.get(`/api/v1/cms/discover/${slug}/contacts/`, undefined, false) as Promise<Record<string, string | boolean>>,
  nearby: (slug: string) => api.get(`/api/v1/cms/discover/${slug}/nearby-temples/`, undefined, false),
  enquiry: (slug: string, body: Record<string, unknown>) => api.post(`/api/v1/cms/discover/${slug}/enquiry/`, body),
};

export const catalogApi = {
  poojas: (page = 1) => api.get("/api/v1/cms/whatsapp/poojas/", { page, page_size: 20 }, false),
  purposes: () => api.get("/api/v1/cms/pooja-purposes/", undefined, false),
  poojaCategories: () => api.get("/api/v1/cms/pooja-categories/", undefined, false),
  categories: (listing_type: ListingType) => api.get("/api/v1/cms/categories/", { listing_type }, false),
  deities: () => api.get("/api/v1/cms/deities/", undefined, false),
};

export const bookingApi = {
  stats: () => api.get("/api/v1/booking/stats/") as Promise<Record<string, unknown>>,
  list: () => api.get("/api/v1/booking/public/"),
  create: (body: Record<string, unknown>) => api.post("/api/v1/booking/public/", body),
  sendOtp: (body: Record<string, unknown>) => api.post("/api/v1/booking/otp/send/", body),
  verifyOtp: (body: Record<string, unknown>) => api.post("/api/v1/booking/otp/verify/", body),
  checkout: (body: Record<string, unknown>) => api.post("/api/v1/booking/checkout/", body),
  receipt: (code: string) => api.get(`/api/v1/booking/receipt/${code}/`) as Promise<Booking>,
  cancel: (uuid: string) => api.del(`/api/v1/booking/${uuid}/`),
};

export const listingApi = {
  mySubmissions: () => api.get("/api/v1/cms/my-listing-submissions/"),
  submissions: () => api.get("/api/v1/cms/listing-submissions/"),
  create: (payload: Record<string, unknown>, files?: Record<string, File | File[] | undefined>) => {
    const form = toFormData(payload, files);
    return form ? api.postForm("/api/v1/cms/listing-submissions/", form) : api.post("/api/v1/cms/listing-submissions/", payload);
  },
  update: (payload: Record<string, unknown>, files?: Record<string, File | File[] | undefined>) => {
    const form = toFormData(payload, files);
    return form ? api.patchForm("/api/v1/cms/listing-submissions/", form) : api.patch("/api/v1/cms/listing-submissions/", payload);
  },
  preferences: () => api.get("/api/v1/cms/listing-preferences/"),
  setPreference: (listing_uuid: string, action: "save" | "unsave" | "subscribe" | "unsubscribe") =>
    api.post("/api/v1/cms/listing-preferences/", { listing_uuid, action }),
};

/** Returns FormData when any file is present, otherwise null (send JSON). */
function toFormData(
  payload: Record<string, unknown>,
  files?: Record<string, File | File[] | undefined>,
): FormData | null {
  const entries = Object.entries(files ?? {}).filter(([, v]) => (Array.isArray(v) ? v.length > 0 : Boolean(v)));
  if (!entries.length) return null;
  const form = new FormData();
  for (const [k, v] of Object.entries(payload)) {
    if (v === undefined || v === null || v === "") continue;
    form.append(k, typeof v === "object" ? JSON.stringify(v) : String(v));
  }
  for (const [k, v] of entries) {
    if (Array.isArray(v)) v.forEach((f) => form.append(k, f));
    else if (v) form.append(k, v);
  }
  return form;
}

/* ================= helpers ================= */
export function money(v: string | number | null | undefined) {
  const n = typeof v === "string" ? Number(v) : (v ?? 0);
  if (!Number.isFinite(n)) return "₹0";
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function placeOf(l: Partial<Listing>) {
  return [l.location, l.city ?? l.district, l.state].filter(Boolean).join(", ");
}

export function errorText(e: unknown) {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return "Something went wrong. Please try again.";
}
