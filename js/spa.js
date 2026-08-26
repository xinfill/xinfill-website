import { showHomeChrome, hideAllContent } from "./view-chrome.js";
import { getCurrentLang } from "./i18n.js";
import {
  PANEL_SECTIONS,
  pathFor,
  parsePath,
  migrateHashToPath,
  updateNavHrefs,
} from "./routes.js";
import { openProductById } from "./product-modal.js";

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

function showHome() {
  hideAllContent();
  showHomeChrome();
  hideExtras();
  document.querySelectorAll(".nav-panel").forEach((p) => p.classList.remove("active"));
  document.querySelectorAll(".nav a[data-section]").forEach((a) => a.classList.remove("active"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function navigate(section, { tab = null, productId = null, replace = false } = {}) {
  const lang = getCurrentLang();
  const path = pathFor(section, { tab, productId, lang });
  if (replace) history.replaceState({ section, tab, productId }, "", path);
  else history.pushState({ section, tab, productId }, "", path);
  handleRoute();
}

function handleRoute() {
  const lang = getCurrentLang();
  updateNavHrefs(lang);

  const route = parsePath(location.pathname, lang);

  if (route.section === "home") {
    showHome();
    return;
  }

  if (route.section === "cart") {
    const page = document.getElementById("cart-page");
    if (!page || page.hidden) {
      document.getElementById("cart-toggle")?.click();
    }
    return;
  }

  if (route.section === "product" && route.productId) {
    const page = document.getElementById("product-page");
    if (page && !page.hidden) return;
    if (!openProductById(route.productId)) {
      showSection("shop");
      history.replaceState({ section: "shop" }, "", pathFor("shop", { lang }));
    }
    return;
  }

  if (PANEL_SECTIONS.includes(route.section)) {
    showSection(route.section, route.tab);
    return;
  }

  showHome();
}

function initSpa() {
  PANEL_SECTIONS.forEach((s) => {
    const el = document.getElementById(s);
    if (el) el.hidden = true;
  });
  hideExtras();
  showHomeChrome();

  const lang = getCurrentLang();
  migrateHashToPath(lang);
  updateNavHrefs(lang);

  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-section]");
    if (!link) return;
    if (link.target === "_blank") return;

    e.preventDefault();
    const section = link.dataset.section;
    const tab = link.dataset.tab || null;

    if (section === "home") {
      navigate("home");
      return;
    }

    if (section === "custom") {
      navigate("custom", { tab: tab || "upload" });
      return;
    }

    if (PANEL_SECTIONS.includes(section)) {
      navigate(section, { tab });
    }
  });

  window.addEventListener("popstate", handleRoute);
  handleRoute();

  document.addEventListener("xinfill-i18n-ready", () => {
    const nextLang = getCurrentLang();
    const route = parsePath(location.pathname, nextLang);
    const nextPath = pathFor(route.section, {
      tab: route.tab,
      productId: route.productId,
      lang: nextLang,
    });
    const current = location.pathname.replace(/\/+$/, "") || "/";
    if (current !== nextPath) {
      history.replaceState(
        { section: route.section, tab: route.tab, productId: route.productId },
        "",
        nextPath
      );
    }
    updateNavHrefs(nextLang);
  });
}

export { initSpa, navigate, handleRoute, showSection, showHome };
