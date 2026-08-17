/* ============================================================
   ACAT Site-wide Theme Toggle (System / Light / Dark)
   Add this ONE script to EVERY page (index.html, blog.html, privacy.html...)
   right after <body> or in <head>:
       <script src="theme-toggle.js"></script>

   How it works:
   - Adds a small floating toggle button (top-left, so it never
     clashes with the chatbot bubble at bottom-right).
   - Cycles: System -> Light -> Dark -> System...
   - Choice is saved in localStorage, so it stays the same across
     ALL pages of the site (same domain) and future visits.
   - Dark mode is applied using a safe CSS filter-invert technique,
     so it works site-wide WITHOUT needing you to rewrite your
     existing style.css. Images, videos, and iframes are
     re-inverted so photos/logos still look correct.
   ============================================================ */
(function () {
  "use strict";

  const KEY = "acat-site-theme"; // "system" | "light" | "dark"
  const ICONS = { system: "🖥️", light: "☀️", dark: "🌙" };
  const mq = window.matchMedia("(prefers-color-scheme: dark)");

  // ---------- 1. Inject dark-mode CSS (filter-based, no site CSS edits needed) ----------
  const style = document.createElement("style");
  style.textContent = `
    html.acat-dark {
      filter: invert(1) hue-rotate(180deg);
      background: #fff;
    }
    /* Re-invert media so photos/logos/videos stay natural */
    html.acat-dark img,
    html.acat-dark video,
    html.acat-dark iframe,
    html.acat-dark picture,
    html.acat-dark canvas,
    html.acat-dark svg image {
      filter: invert(1) hue-rotate(180deg);
    }
    /* Keep the theme toggle button itself normal-looking */
    html.acat-dark #acat-theme-btn {
      filter: invert(1) hue-rotate(180deg);
    }
    #acat-theme-btn {
      position: fixed; top: 18px; left: 18px; z-index: 9999;
      width: 42px; height: 42px; border-radius: 50%;
      background: #0f766e; color: #fff; border: none; cursor: pointer;
      box-shadow: 0 4px 14px rgba(0,0,0,.25);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; transition: transform .2s ease;
    }
    #acat-theme-btn:hover { transform: scale(1.08); }
  `;
  document.head.appendChild(style);

  // ---------- 2. Toggle button ----------
  const btn = document.createElement("button");
  btn.id = "acat-theme-btn";
  btn.setAttribute("aria-label", "Toggle site theme");
  btn.title = "Toggle theme (system / light / dark)";
  document.body.appendChild(btn);

  // ---------- 3. Apply / persist theme ----------
  function getSaved() {
    try { return localStorage.getItem(KEY) || "system"; }
    catch (e) { return "system"; }
  }
  function save(t) {
    try { localStorage.setItem(KEY, t); } catch (e) {}
  }
  function resolved(pref) {
    return pref === "system" ? (mq.matches ? "dark" : "light") : pref;
  }
  function apply(pref) {
    document.documentElement.classList.toggle("acat-dark", resolved(pref) === "dark");
    btn.textContent = ICONS[pref];
  }

  let pref = getSaved();
  apply(pref);

  mq.addEventListener("change", () => { if (pref === "system") apply("system"); });

  btn.addEventListener("click", () => {
    const order = ["system", "light", "dark"];
    pref = order[(order.indexOf(pref) + 1) % order.length];
    save(pref);
    apply(pref);
  });

  // Keep in sync if theme is changed on another tab/page
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) { pref = e.newValue || "system"; apply(pref); }
  });
})();
