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

  // Close on link click (mobile)
  nav.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  });

  // Close on outside click
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

function setupQuoteFormMailto() {
  const form = $("#quoteForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const name = (data.get("name") || "").toString().trim();
    const contact = (data.get("contact") || "").toString().trim();
    const details = (data.get("details") || "").toString().trim();

    // Replace this email when you have the business email ready
    const toEmail = "example@domain.com";

    const subject = encodeURIComponent(`Quote Request — ${name || "New Customer"}`);
    const body = encodeURIComponent(
      `Name: ${name}\nContact: ${contact}\n\nJob Details:\n${details}\n\nService Area: East Windsor, CT (40 mi radius)\n`
    );

    window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
  });
}

setupYear();
setupMobileNav();
setupSmoothScroll();
setupQuoteFormMailto();