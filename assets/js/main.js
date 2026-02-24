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

function setupQuoteFormAjax() {
  const form = document.getElementById("quoteForm");
  if (!form) return;

  const successEl = document.getElementById("quoteSuccess");
  const errorEl = document.getElementById("quoteError");

  // ✅ ADD THIS BLOCK RIGHT HERE (initial state on page load)
  if (successEl) successEl.hidden = true;
  if (errorEl) errorEl.hidden = true;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Hide previous status (keep this)
    if (successEl) successEl.hidden = true;
    if (errorEl) errorEl.hidden = true;

    const data = new FormData(form);

    // Attment data
    const files = form.querySelector('input[type="file"][name="attachments"]')?.files;

    const MAX_FILES = 10;
    const MAX_EACH = 25 * 1024 * 1024;  // 25MB
    const MAX_TOTAL = 100 * 1024 * 1024; // 100MB total request size guideline

    if (files && files.length) {
      if (files.length > MAX_FILES) {
        if (errorEl) {
          errorEl.hidden = false;
          errorEl.querySelector?.(".alert__title") && (errorEl.querySelector(".alert__title").textContent = "Too many files.");
          errorEl.querySelector?.(".alert__msg") && (errorEl.querySelector(".alert__msg").textContent = `Please upload ${MAX_FILES} photos or fewer.`);
        }
        return;
      }

      let total = 0;
      for (const f of files) {
        total += f.size;
        if (f.size > MAX_EACH) {
          if (errorEl) errorEl.hidden = false;
          // If you're not using the alert markup, just set textContent instead.
          return;
        }
      }

      if (total > MAX_TOTAL) {
        if (errorEl) errorEl.hidden = false;
        return;
      }
    }

    // Build clean message

    const fullName = (data.get("full_name") || "").toString().trim();
    const nameParts = fullName.split(/\s+/).filter(Boolean);
    const first = nameParts[0] || "";
    const last = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    // Write parsed name into hidden fields (if present)
    const firstEl = document.getElementById("firstName");
    const lastEl = document.getElementById("lastName");
    if (firstEl) firstEl.value = first;
    if (lastEl) lastEl.value = last;

    const email = (data.get("email") || "").toString().trim();
    const location = (data.get("location") || "").toString().trim();
    const details = (data.get("details") || "").toString().trim();

    // 🔹 CLEAN PHONE BEFORE SENDING
    let phone = (data.get("phone") || "").toString().trim();
    let digits = phone.replace(/\D/g, "");
    if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);

    if (digits.length === 10) {
      phone = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
    }

    const phoneInputEl = document.getElementById("phoneInput");
    if (phoneInputEl) phoneInputEl.value = phone;

    // Contact tag
    const cityGuess = (location.split(",")[0] || "").trim();
    const cityClean = cityGuess.replace(/[^a-zA-Z0-9]+/g, "");
    const firstClean = first.replace(/[^a-zA-Z0-9]+/g, "");
    const contactTag = `${cityClean || "UnknownCity"}_${firstClean || "UnknownName"}`;

    const contactEl = document.getElementById("contactTag");
    if (contactEl) contactEl.value = contactTag;

    const compiled =
    `New Quote Request

    Contact Tag: ${contactTag}
    Name: ${fullName || "(not provided)"}
    Phone: ${phone || "(not provided)"}
    Email: ${email || "(not provided)"}
    Pickup town: ${location || "(not provided)"}

    Job Details:
    ${details || "(not provided)"}

    Source: Website form`;

    const msgEl = document.getElementById("compiledMessage");
    if (msgEl) msgEl.value = compiled;

    // Fecth stuff
    try {
      const resp = await fetch(form.action, {
        method: "POST",
        body: data, // ✅ reuse the same FormData
        headers: { "Accept": "application/json" }
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

  // 🔹 LIVE PHONE FORMATTER
  const phoneInput = document.getElementById("phoneInput");

  if (phoneInput) {
    phoneInput.addEventListener("input", (e) => {
      let digits = e.target.value.replace(/\D/g, "");

      if (digits.length > 10) digits = digits.slice(0, 10);

      let formatted = digits;

      if (digits.length > 6) {
        formatted = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
      } else if (digits.length > 3) {
        formatted = `(${digits.slice(0,3)}) ${digits.slice(3)}`;
      } else if (digits.length > 0) {
        formatted = `(${digits}`;
      }

      e.target.value = formatted;
    });
  }
});