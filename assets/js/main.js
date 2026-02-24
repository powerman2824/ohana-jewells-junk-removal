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
    const parts = fullName.split(/\s+/).filter(Boolean);

    const first = parts[0] || "";
    const last = parts.length > 1 ? parts.slice(1).join(" ") : "";

    document.getElementById("firstName").value = first;
    document.getElementById("lastName").value = last;

    const phone = (data.get("phone") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const location = (data.get("location") || "").toString().trim();
    const details = (data.get("details") || "").toString().trim();

    // Parse City + State from "City, ST" or "City ST"
    let city = "";
    let state = "";

    if (location) {
      if (location.includes(",")) {
        const [cityPart, restPart = ""] = location.split(",", 2);
        city = cityPart.trim();

        // Take first token after comma as state (handles "MA", "MA 02101", etc.)
        const stateToken = restPart.trim().split(/\s+/)[0] || "";
        state = stateToken.toUpperCase();
      } else {
        // If no comma, try "City ST" (last token 2 letters)
        const parts = location.split(/\s+/).filter(Boolean);
        const last = parts[parts.length - 1] || "";
        if (last.length === 2 && /^[a-zA-Z]{2}$/.test(last)) {
          state = last.toUpperCase();
          city = parts.slice(0, -1).join(" ");
        } else {
          city = location; // fallback
        }
      }
    }

    // Write parsed fields into hidden inputs so Formspree/Airtable receives them
    const cityEl = document.getElementById("cityField");
    const stateEl = document.getElementById("stateField");
    if (cityEl) cityEl.value = city || "";
    if (stateEl) stateEl.value = state || "";

    // Build contact tag: City + FirstName (e.g., BostonJonny)

    const firstName = (fullName.split(/\s+/)[0] || "").trim();

    // Clean for tag: remove spaces/symbols
    const cityClean = (city || "").replace(/[^a-zA-Z0-9]+/g, "");
    const firstClean = (firstName || "").replace(/[^a-zA-Z0-9]+/g, "");

    const contactTag = `${cityClean}_${firstClean}`;

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

    try {
      const resp = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      });

      if (resp.ok) {
        form.reset();
        // ✅ OPTIONAL: explicitly keep the other one hidden
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
  setupQuoteFormAjax(); // <- use this
});