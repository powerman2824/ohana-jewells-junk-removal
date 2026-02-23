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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Hide previous status
    if (successEl) successEl.hidden = true;
    if (errorEl) errorEl.hidden = true;

    const data = new FormData(form);

    // Build clean message
    const name = (data.get("name") || "").toString().trim();
    const contact = (data.get("contact") || "").toString().trim();
    const location = (data.get("location") || "").toString().trim();
    const details = (data.get("details") || "").toString().trim();

    const compiled =
`New Quote Request

Name: ${name || "(not provided)"}
Contact: ${contact || "(not provided)"}
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
        if (successEl) successEl.hidden = false;
      } else {
        if (errorEl) errorEl.hidden = false;
      }
    } catch (err) {
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