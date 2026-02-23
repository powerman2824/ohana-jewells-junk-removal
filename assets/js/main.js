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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = new FormData(form);

    // If you’re compiling a message field, do it here before sending.
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
        const ok = document.getElementById("quoteSuccess");
        if (ok) ok.hidden = false;
      } else {
        const err = document.getElementById("quoteError");
        if (err) err.hidden = false;
      }
    } catch {
      const err = document.getElementById("quoteError");
      if (err) err.hidden = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupYear();
  setupMobileNav();
  setupSmoothScroll();
  setupQuoteFormMailto();
});