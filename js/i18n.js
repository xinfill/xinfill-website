let translations = {};

const LANGS = ["pl", "en", "ru", "uk"];

function getDomainDefaultLang() {
  const host = location.hostname.toLowerCase();
  if (host.endsWith(".eu") || host === "xinfill.eu") return "en";
  if (host.endsWith(".pl") || host === "xinfill.pl") return "pl";
  return "pl";
}

let currentLang = localStorage.getItem("xinfill-lang") || getDomainDefaultLang();

async function loadTranslations(lang) {
  try {
    const res = await fetch(`locales/${lang}.json?v=${Date.now()}`);
    translations = await res.json();
    currentLang = lang;
    localStorage.setItem("xinfill-lang", lang);
    applyTranslations();
    updateLangButtons();
    document.documentElement.lang = lang;
    document.dispatchEvent(new CustomEvent("xinfill-i18n-ready"));
  } catch (e) {
    console.error("Failed to load translations:", e);
  }
}

function t(key) {
  const parts = key.split(".");
  let val = translations;
  for (const p of parts) {
    val = val?.[p];
  }
  return val ?? key;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const text = t(key);
    if (text) el.textContent = text;
  });

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    const text = t(key);
    if (text) el.innerHTML = text;
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    const text = t(key);
    if (text) el.placeholder = text;
  });
}

function updateLangButtons() {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === currentLang);
  });
}

function initI18n() {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => loadTranslations(btn.dataset.lang));
  });
  loadTranslations(currentLang);
}

export { loadTranslations, t, initI18n, currentLang };
