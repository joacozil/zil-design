/**
 * Lead capture — the single source of truth for every contact form on the site,
 * the way scripts/reveal.ts is for entrance motion.
 *
 * The page has the SAME form in two places (sections/CTA.astro and the mobile
 * ContactDrawer). Neither knows anything about the API: they declare markup and
 * this engine drives it, so the endpoint, the payload shape and the redirect
 * exist once.
 *
 *   data-lead-root                 wrapper holding the form and its success panel
 *   data-lead-form                 the <form> to wire (must be inside a root)
 *   data-lead-error                error line inside the form, hidden until needed
 *   data-lead-success              the panel shown once the lead is accepted
 *   data-lead-phase="confirmed"    first beat: "recibido"
 *   data-lead-phase="redirecting"  second beat: heading to the calendar
 *   data-lead-booking              anchor whose href gets the ?leadId= appended
 *   data-lead-placement="cta"      which surface converted — sent with the lead,
 *                                  not with the abandonment beacon (see below)
 *
 * Hidden elements carry `hidden` in the markup and the classes they animate FROM
 * (`opacity-0`, `translate-y-*`); this file only adds and removes classes, so the
 * look stays in the markup with the rest of the design system.
 *
 * WHY the flow ends at the calendar: a lead that books is worth several that only
 * left an email, and the moment right after submitting is the only one where the
 * reader has already decided. So the success state is not a dead end — it is a
 * 2-second handoff into workspace's booking page, with a manual link for when the
 * automatic redirect is blocked.
 */

// This file has no imports, so TypeScript would read it as a global script and
// reject the `declare global` below. The empty export makes it a module — which
// is what Astro's `<script>` bundling treats it as anyway.
export {};

declare global {
  interface Window {
    // Meta Pixel / GA4. Both tags are installed inline in Layout.astro, which
    // defines these stubs synchronously — but they stay optional here because an
    // ad-blocker or a consent manager can remove them at any point, and a lead
    // must never depend on a measurement global existing.
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

const API_URL = "https://workspace.zil.global/api/leads";
const PARTIAL_URL = "https://workspace.zil.global/api/leads/partial";
const BOOKING_URL = "https://workspace.zil.global/book/zil";

/**
 * Routing identity for every lead this site sends.
 *
 * `businessUnit` is a HINT, not a decision: workspace resolves the BU from the
 * submitting hostname first and only falls back to this (see resolveLeadBU in
 * leadWebhookController). We are served from zil.global, which already maps to
 * the zil BU, so both paths agree — declaring it keeps the payload honest if the
 * site is ever moved to its own domain.
 *
 * `formId` is what actually separates Design's leads from the ecosystem form's
 * (`web-contact-zil-ecosistema`) in workspace's reporting. Both placements share
 * it on purpose — splitting the id would split the funnel; `formPlacement` below
 * is the field that tells the two surfaces apart.
 */
const BUSINESS_UNIT = "zil";
const FORM_ID = "web-contact-zil-design";
const SOURCE = "zil-design";

/** Markup keeps the site's Spanish field names; the API has its own. Map once. */
const FIELD_MAP: Record<string, string> = {
  nombre: "fullName",
  empresa: "company",
  email: "email",
  celular: "phone",
  mensaje: "message",
};

/** The reader is on the page from here — workspace rejects sub-2s submits as bots. */
const enteredAt = Date.now().toString();

/**
 * Has ANYONE on this page converted yet? Page-level, not per-form, and that is
 * the whole point: both forms are always in the DOM, so a reader who starts
 * typing in the mobile drawer, gives up on it and converts through the CTA
 * instead would otherwise have their half-typed drawer draft beaconed as an
 * abandonment by the very redirect that completed the sale — filing a phantom
 * "lost" lead against someone who just booked.
 *
 * That path is not hypothetical: the drawer stashes itself as soon as the CTA
 * section comes on screen (see ContactDrawer's .at-cta rule), so switching from
 * one to the other is the flow the page actively encourages.
 */
let converted = false;

const getCookie = (name: string): string => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : "";
};

/** One id per tab, so an abandoned draft and the eventual lead can be stitched. */
const getSessionId = (): string => {
  let id = sessionStorage.getItem("sessionId");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("sessionId", id);
  }
  return id;
};

const getUTMs = (): Record<string, string> => {
  const params = new URLSearchParams(window.location.search);
  const utms: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    if (key.startsWith("utm_") || key === "fbclid" || key === "gclid") {
      utms[key] = value;
    }
  }
  return utms;
};

/**
 * Attribution + technical context. The IP lookup is a third-party round trip, so
 * it is capped and its failure is ignored — the backend also reads the IP from
 * request headers, and no enrichment is worth losing the lead over.
 */
const getTrackingData = async () => {
  let ip = "";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch("https://api.ipify.org?format=json", {
      signal: controller.signal,
    });
    if (res.ok) ip = (await res.json()).ip ?? "";
  } catch {
    // offline or timed out — headers still carry it
  } finally {
    clearTimeout(timeout);
  }

  return {
    ip,
    url: window.location.href,
    referrer: document.referrer || "",
    userAgent: navigator.userAgent || "",
    fbc: getCookie("_fbc"),
    fbp: getCookie("_fbp"),
    sessionId: getSessionId(),
    ...getUTMs(),
  };
};

/** Read a form into the API's field names, skipping the honeypot. */
const readFields = (form: HTMLFormElement): Record<string, string> => {
  const data = new FormData(form);
  const fields: Record<string, string> = {};
  for (const [name, apiName] of Object.entries(FIELD_MAP)) {
    fields[apiName] = String(data.get(name) ?? "").trim();
  }
  return fields;
};

const hasContent = (fields: Record<string, string>) =>
  Object.values(fields).some(Boolean);

/**
 * Run an analytics call so it can never fail the submit around it.
 *
 * `fbq` and `gtag` are third-party globals: a consent manager that wraps them, a
 * GTM tag that errors, or an ad-blocker shim that patches half of one can all
 * throw. Unguarded, that exception is indistinguishable from the API rejecting
 * the lead — the reader is told their message was lost, and the retry files a
 * duplicate. Losing one measurement event is the cheap failure; losing the lead's
 * credibility is not.
 */
const track = (fn: () => void) => {
  try {
    fn();
  } catch {
    // measurement is never worth a failed submit
  }
};

/** Reveal an element that is parked at `hidden` + its from-classes. */
const enter = (el: HTMLElement, from: string[]) => {
  el.hidden = false;
  // Flush layout so the browser has a rendered "before" state to transition from;
  // dropping the classes in the same tick as `hidden` would land the element at
  // its final style with nothing to animate.
  //
  // NOT requestAnimationFrame, which is the usual idiom for this: rAF never fires
  // in a document that is not rendering (background tab, headless renderer), and
  // the reader would come back to a success panel stranded at `opacity-0` — the
  // exact trap the reveal guard in Layout.astro exists to avoid. Reading a layout
  // property is synchronous and correct either way: a visible document animates,
  // a hidden one simply arrives at the final state.
  void el.offsetHeight;
  el.classList.remove(...from);
};

const wire = (form: HTMLFormElement) => {
  const root = form.closest<HTMLElement>("[data-lead-root]");
  if (!root) return;

  const success = root.querySelector<HTMLElement>("[data-lead-success]");
  const confirmed = root.querySelector<HTMLElement>(
    '[data-lead-phase="confirmed"]',
  );
  const redirecting = root.querySelector<HTMLElement>(
    '[data-lead-phase="redirecting"]',
  );
  const booking = root.querySelector<HTMLAnchorElement>("[data-lead-booking]");
  const errorEl = form.querySelector<HTMLElement>("[data-lead-error]");
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const placement = form.dataset.leadPlacement || "unknown";

  let sending = false;
  let sent = false;

  /**
   * Abandoned-form recovery. A reader who typed their name and left is a lead we
   * already earned; sendBeacon survives the unload that a fetch would not.
   * `pagehide` rather than `beforeunload` because iOS Safari fires only the former.
   */
  const captureAbandoned = () => {
    if (sending || sent || converted) return;
    const fields = readFields(form);
    if (!hasContent(fields)) return;

    // No `formPlacement` here, unlike the full submit: capturePartialLead reads
    // only these five keys and FormSnapshot has no column for it, so sending it
    // would be payload that quietly goes nowhere. Which surface an ABANDONED
    // draft came from is therefore not recoverable — the completed-lead path
    // keeps it (createWebLead stores the whole body under metaData).
    const payload = {
      sessionId: getSessionId(),
      formId: FORM_ID,
      businessUnit: BUSINESS_UNIT,
      fields,
      session: {
        url: window.location.href,
        referrer: document.referrer || "",
        userAgent: navigator.userAgent || "",
      },
    };
    navigator.sendBeacon(
      PARTIAL_URL,
      new Blob([JSON.stringify(payload)], { type: "application/json" }),
    );
  };
  window.addEventListener("pagehide", captureAbandoned);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending || sent) return;

    sending = true;
    if (errorEl) errorEl.hidden = true;
    if (submit) {
      submit.disabled = true;
      submit.classList.add("pointer-events-none", "opacity-60");
    }

    try {
      // Fired before the request: the pixel measures intent, and holding it back
      // behind our own API's latency would under-report every slow response.
      track(() =>
        window.fbq?.("track", "Lead", {
          content_name: "Zil Design Contact Form",
          content_category: "Form Submission",
        }),
      );

      const tracking = await getTrackingData();
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...readFields(form),
          _gotcha: String(new FormData(form).get("_gotcha") ?? ""),
          source: SOURCE,
          businessUnit: BUSINESS_UNIT,
          formId: FORM_ID,
          formPlacement: placement,
          form_entered_at: enteredAt,
          ...tracking,
        }),
      });

      if (!response.ok) throw new Error(`Lead API responded ${response.status}`);

      // The lead EXISTS from here on. Latch it before anything else can throw:
      // everything below is presentation, and a failure there that fell through
      // to the catch would tell the reader their message was lost and invite the
      // retry that files it a second time.
      sent = true;
      // Silences the OTHER form's abandonment beacon too — see `converted`.
      converted = true;

      // The id is what ties the booking back to this lead. Its absence is not an
      // error — the calendar still works, it just opens unlinked.
      let leadId: string | null = null;
      try {
        const data = await response.json();
        leadId = data?.id || data?._id || data?.leadId || data?.lead?._id || null;
      } catch {
        // a non-JSON 2xx is still a success
      }

      track(() =>
        window.gtag?.("event", "generate_lead", {
          form_id: FORM_ID,
          lead_id: leadId || undefined,
          currency: "USD",
          value: 1,
        }),
      );

      const bookingUrl = leadId
        ? `${BOOKING_URL}?leadId=${encodeURIComponent(leadId)}`
        : BOOKING_URL;
      if (booking) booking.href = bookingUrl;

      // Hand off: confirm, then say where we are taking them, then go. The two
      // beats exist so the redirect is never a page yanked out from under them.
      form.hidden = true;
      if (success) enter(success, ["opacity-0", "translate-y-2"]);

      setTimeout(() => {
        if (confirmed) confirmed.hidden = true;
        if (redirecting) enter(redirecting, ["opacity-0"]);
      }, 1100);
      setTimeout(() => {
        window.location.href = bookingUrl;
      }, 2200);
    } catch {
      // Never offer a retry for a lead the server already has — see the latch
      // above. This only catches failures on the way TO a lead.
      if (sent) return;
      sending = false;
      if (submit) {
        submit.disabled = false;
        submit.classList.remove("pointer-events-none", "opacity-60");
      }
      if (errorEl) errorEl.hidden = false;
    }
  });
};

document
  .querySelectorAll<HTMLFormElement>("form[data-lead-form]")
  .forEach(wire);
