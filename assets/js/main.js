// Basic UX helpers (no frameworks)
const $ = (sel, root = document) => root.querySelector(sel);

function setupYear() {
  const el = $("#year");
  if (el) el.textContent = new Date().getFullYear();
}

function setupMobileNav() {
  const toggle = $(".nav-toggle");
  const nav = $("#site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  });

  document.addEventListener("click", (e) => {
    if (nav.contains(e.target) || toggle.contains(e.target)) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  });
}

function setupSmoothScroll() {
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href || href.length < 2) return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.pushState(null, "", href);
  });
}

/**
 * Quote Form AJAX (stays on page; no Formspree redirect)
 * - Parses full name into first/last
 * - Parses location into city/state (best-effort)
 * - Formats phone
 * - Builds "contact" tag (City_FirstName)
 * - Compiles a clean email message into hidden "message"
 * - Sends FormData via fetch to Formspree
 */
function setupQuoteFormAjax() {
  const form = document.getElementById("quoteForm");
  if (!form) return;

  const successEl = document.getElementById("quoteSuccess");
  const errorEl = document.getElementById("quoteError");

  // Helper: set a field by name (most reliable for Formspree)
  const setByName = (name, value) => {
    const el = form.querySelector(`[name="${name}"]`);
    if (el) el.value = value ?? "";
  };

  // Also update hidden fields by id (matches your HTML)
  const setById = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value ?? "";
  };

  // Start hidden
  if (successEl) successEl.hidden = true;
  if (errorEl) errorEl.hidden = true;

  form.addEventListener("submit", async (e) => {
    // ✅ critical: prevents redirect away from your page
    e.preventDefault();

    if (successEl) successEl.hidden = true;
    if (errorEl) errorEl.hidden = true;

    // --- Optional attachment validation ---
    const files = form.querySelector('input[type="file"][name="attachments"]')?.files;
    const MAX_FILES = 10;
    const MAX_EACH = 25 * 1024 * 1024;   // 25MB each
    const MAX_TOTAL = 100 * 1024 * 1024; // 100MB total guideline

    if (files && files.length) {
      if (files.length > MAX_FILES) {
        if (errorEl) errorEl.hidden = false;
        return;
      }
      let total = 0;
      for (const f of files) {
        total += f.size;
        if (f.size > MAX_EACH) {
          if (errorEl) errorEl.hidden = false;
          return;
        }
      }
      if (total > MAX_TOTAL) {
        if (errorEl) errorEl.hidden = false;
        return;
      }
    }

    // --- Read raw inputs ---
    const fullNameRaw = (form.querySelector('[name="full_name"]')?.value || "").trim();
    const emailRaw = (form.querySelector('[name="email"]')?.value || "").trim();
    const phoneRaw = (form.querySelector('[name="phone"]')?.value || "").trim();
    const locationRaw = (form.querySelector('[name="location"]')?.value || "").trim();
    const detailsRaw = (form.querySelector('[name="details"]')?.value || "").trim();

    // --- Name parsing ---
    const nameParts = fullNameRaw.split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    // Populate hidden fields (both id + name just to be safe)
    setById("firstName", firstName);
    setById("lastName", lastName);
    setByName("first_name", firstName);
    setByName("last_name", lastName);

    // --- Phone normalize to (555) 555-5555 ---
    let digits = phoneRaw.replace(/\D/g, "");
    if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);

    let phoneFormatted = phoneRaw;
    if (digits.length === 10) {
      phoneFormatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }

    // Update visible phone field too (so user sees the formatted output)
    const phoneInputEl = document.getElementById("phoneInput") || form.querySelector('[name="phone"]');
    if (phoneInputEl) phoneInputEl.value = phoneFormatted;

    // --- City/State parsing ---
    let city = "";
    let state = "";

    if (locationRaw) {
      if (locationRaw.includes(",")) {
        const [cityPart, restPart = ""] = locationRaw.split(",", 2);
        city = cityPart.trim();
        state = (restPart.trim().split(/\s+/)[0] || "").toUpperCase();
      } else {
        const locParts = locationRaw.split(/\s+/).filter(Boolean);
        const lastToken = locParts[locParts.length - 1] || "";
        if (lastToken.length === 2 && /^[a-zA-Z]{2}$/.test(lastToken)) {
          state = lastToken.toUpperCase();
          city = locParts.slice(0, -1).join(" ");
        } else {
          city = locationRaw;
        }
      }
    }

    setById("cityField", city);
    setById("stateField", state);
    setByName("city", city);
    setByName("state", state);

    // --- Contact tag City_FirstName ---
    const cityClean = (city || "").replace(/[^a-zA-Z0-9]+/g, "");
    const firstClean = (firstName || "").replace(/[^a-zA-Z0-9]+/g, "");
    const contactTag = `${cityClean || "UnknownCity"}_${firstClean || "UnknownName"}`;

    setById("contactTag", contactTag);
    setByName("contact", contactTag);

    // --- Compiled message ---
    const compiled =
`New Quote Request

Contact Tag: ${contactTag}
Name: ${fullNameRaw || "(not provided)"}
Phone: ${phoneFormatted || "(not provided)"}
Email: ${emailRaw || "(not provided)"}
Pickup town: ${locationRaw || "(not provided)"}
Parsed City/State: ${city || "(n/a)"} ${state || ""}

Job Details:
${detailsRaw || "(not provided)"}

Source: Website form`;

    setById("compiledMessage", compiled);
    setByName("message", compiled);

    // ✅ IMPORTANT: Build FormData AFTER we set hidden fields and formatted phone
    const dataToSend = new FormData(form);

    try {
      const resp = await fetch(form.action, {
        method: "POST",
        body: dataToSend,
        headers: { Accept: "application/json" }
      });

      if (resp.ok) {
        form.reset();
        if (errorEl) errorEl.hidden = true;
        if (successEl) successEl.hidden = false;
      } else {
        if (successEl) successEl.hidden = true;
        if (errorEl) errorEl.hidden = false;
      }
    } catch (err) {
      if (successEl) successEl.hidden = true;
      if (errorEl) errorEl.hidden = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupYear();
  setupMobileNav();
  setupSmoothScroll();
  setupQuoteFormAjax();

  // LIVE PHONE FORMATTER (keeps typing nice)
  const phoneInput = document.getElementById("phoneInput");
  if (phoneInput) {
    phoneInput.addEventListener("input", (e) => {
      let digits = e.target.value.replace(/\D/g, "");
      if (digits.length > 10) digits = digits.slice(0, 10);

      let formatted = digits;

      if (digits.length > 6) {
        formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      } else if (digits.length > 3) {
        formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      } else if (digits.length > 0) {
        formatted = `(${digits}`;
      }

      e.target.value = formatted;
    });
  }
});