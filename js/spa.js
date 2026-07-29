import { showHomeChrome, hideAllContent } from "./view-chrome.js";

const PANEL_SECTIONS = ["shop", "models", "custom", "dostawa", "contact"];
const EXTRA_PAGES = ["product-page", "cart-page"];

function hideExtras() {
  EXTRA_PAGES.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.hidden = true;
  });
}

function revealFadeIns(root) {
  if (!root) return;
  root.querySelectorAll(".fade-in").forEach((el) => el.classList.add("visible"));
}

function showSection(id, tab) {
  showHomeChrome();
  hideExtras();
  PANEL_SECTIONS.forEach((s) => {
    const el = document.getElementById(s);
    if (!el) return;
    el.hidden = s !== id;
    if (s === id) revealFadeIns(el);
  });

  if (id === "custom" && tab) {
    setTimeout(() => {
      const btn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
      btn?.click();
    }, 10);
  }

  document.querySelectorAll(".nav-panel").forEach((p) => {
    const pSection = p.dataset.section;
    const pTab = p.dataset.tab;
    const isMatch = pSection === id && (!pTab || pTab === tab);
    p.classList.toggle("active", isMatch);
  });

  document.querySelectorAll(".nav a[data-section]").forEach((a) => {
    a.classList.toggle("active", a.dataset.section === id);
  });

  const target = document.getElementById(id);
  if (target) {
    setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }
}

function handleRoute() {
  const hash = location.hash.replace(/^#/, "");

  if (!hash || hash === "home") {
    hideAllContent();
    showHomeChrome();
    hideExtras();
    document.querySelectorAll(".nav-panel").forEach((p) => p.classList.remove("active"));
    document.querySelectorAll(".nav a[data-section]").forEach((a) => a.classList.remove("active"));
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (hash === "cart") {
    document.getElementById("cart-toggle")?.click();
    return;
  }

  if (PANEL_SECTIONS.includes(hash)) {
    const tab = hash === "custom" ? new URLSearchParams(location.search).get("tab") : null;
    showSection(hash, tab);
    return;
  }

  // Nieznany hash (np. #product-magnet) — pokaż start, żeby strona nie była pusta
  hideAllContent();
  showHomeChrome();
  hideExtras();
  document.querySelectorAll(".nav-panel").forEach((p) => p.classList.remove("active"));
  document.querySelectorAll(".nav a[data-section]").forEach((a) => a.classList.remove("active"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function initSpa() {
  PANEL_SECTIONS.forEach((s) => {
    const el = document.getElementById(s);
    if (el) el.hidden = true;
  });
  hideExtras();
  showHomeChrome();

  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-section]");
    if (!link) return;

    e.preventDefault();
    const section = link.dataset.section;
    const tab = link.dataset.tab || null;

    if (section === "home") {
      history.replaceState(null, "", "#home");
      handleRoute();
      return;
    }

    if (PANEL_SECTIONS.includes(section)) {
      showSection(section, tab);
      history.replaceState(null, "", `#${section}`);
    }
  });

  window.addEventListener("hashchange", handleRoute);
  handleRoute();
}

export { initSpa };
