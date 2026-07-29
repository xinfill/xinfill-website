import { showHomeChrome, hideAllContent } from "./view-chrome.js";

const PANEL_SECTIONS = ["shop", "models", "custom", "dostawa", "contact"];
const EXTRA_PAGES = ["product-page", "cart-page"];

function hideExtras() {
  EXTRA_PAGES.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.hidden = true;
  });
}

function showSection(id, tab) {
  showHomeChrome();
  hideExtras();
  PANEL_SECTIONS.forEach((s) => {
    const el = document.getElementById(s);
    if (!el) return;
    el.hidden = s !== id;
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
      hideAllContent();
      showHomeChrome();
      document.querySelectorAll(".nav-panel").forEach((p) => p.classList.remove("active"));
      document.querySelectorAll(".nav a[data-section]").forEach((a) => a.classList.remove("active"));
      window.scrollTo({ top: 0, behavior: "smooth" });
      history.replaceState(null, "", "#home");
      return;
    }

    if (PANEL_SECTIONS.includes(section)) {
      showSection(section, tab);
      history.replaceState(null, "", `#${section}`);
    }
  });

  const hash = location.hash.replace("#", "");
  if (hash && PANEL_SECTIONS.includes(hash)) {
    showSection(hash);
  }
}

export { initSpa };
