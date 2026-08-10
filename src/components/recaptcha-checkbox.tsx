import { useEffect, useRef, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { loadRecaptcha, recaptchaSiteKey } from "@/lib/api";

/**
 * Google reCAPTCHA v2 "I'm not a robot" checkbox.
 * Calls onChange with the response token, or null when it expires/errors.
 */
export function RecaptchaCheckbox({
  onChange,
  resetKey,
}: {
  onChange: (token: string | null) => void;
  resetKey?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<number | null>(null);
  const cbRef = useRef(onChange);
  cbRef.current = onChange;
  const [state, setState] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    let cancelled = false;
    if (!recaptchaSiteKey) {
      setState("unavailable");
      return;
    }
    void loadRecaptcha().then((ok) => {
      if (cancelled) return;
      const g = window.grecaptcha;
      if (!ok || !g?.render || !hostRef.current) {
        setState("unavailable");
        return;
      }
      try {
        widgetRef.current = g.render(hostRef.current, {
          sitekey: recaptchaSiteKey,
          callback: (token: string) => cbRef.current(token),
          "expired-callback": () => cbRef.current(null),
          "error-callback": () => cbRef.current(null),
        });
        setState("ready");
      } catch (e) {
        console.error("[recaptcha] render failed — check the v2 checkbox site key and that this domain is authorised:", window.location.hostname, e);
        setState("unavailable");
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Reset the widget when the parent asks (e.g. after a failed submit).
  useEffect(() => {
    if (resetKey === undefined || widgetRef.current === null) return;
    try {
      window.grecaptcha?.reset(widgetRef.current);
      cbRef.current(null);
    } catch {
      /* ignore */
    }
  }, [resetKey]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={hostRef} className="min-h-[78px] flex items-center justify-center" />
      {state === "loading" && (
        <span className="flex items-center gap-2 text-xs text-ink-soft">
          <Loader2 className="size-3.5 animate-spin" /> Loading verification…
        </span>
      )}
      {state === "unavailable" && (
        <span className="flex items-center gap-2 text-xs text-ink-soft text-center">
          <ShieldAlert className="size-3.5 shrink-0" /> Verification unavailable — you can still continue.
        </span>
      )}
    </div>
  );
}
