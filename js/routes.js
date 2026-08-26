/** Localized path routes — no hash URLs */

const ROUTE_SLUGS = {
  pl: {
    home: "",
    shop: "sklep",
    models: "modele",
    upload: "wlasny-plik",
    calc: "cennik",
    dostawa: "dostawa",
    contact: "kontakt",
    cart: "koszyk",
    product: "produkt",
  },
  en: {
    home: "",
    shop: "shop",
    models: "models",
    upload: "your-file",
    calc: "pricing",
    dostawa: "delivery",
    contact: "contact",
    cart: "cart",
    product: "product",
  },
  ru: {
    home: "",
    shop: "gadzhety",
    models: "modeli",
    upload: "svoy-fayl",
    calc: "ceny",
    dostawa: "dostavka",
    contact: "kontakt",
    cart: "korzina",
    product: "tovar",
  },
  uk: {
    home: "",
    shop: "hadzhety",
    models: "modeli",
    upload: "svij-fajl",
    calc: "ciny",
    dostawa: "dostavka",
    contact: "kontakt",
    cart: "koshyk",
    product: "tovar",
  },
};

const PANEL_SECTIONS = ["shop", "models", "custom", "dostawa", "contact"];

function normalizeLang(lang) {
  return ROUTE_SLUGS[lang] ? lang : "pl";
}

function getSlugs(lang) {
  return ROUTE_SLUGS[normalizeLang(lang)];
}

/** Build path for a section, e.g. shop → /sklep */
function pathFor(section, { tab = null, productId = null, lang } = {}) {
  const slugs = getSlugs(lang);
  if (section === "home" || !section) return "/";
  if (section === "cart") return `/${slugs.cart}`;
  if (section === "product" && productId) return `/${slugs.product}/${encodeURIComponent(productId)}`;
  if (section === "custom") {
    if (tab === "calc") return `/${slugs.calc}`;
    return `/${slugs.upload}`;
  }
  if (PANEL_SECTIONS.includes(section) && section !== "custom") {
    return `/${slugs[section]}`;
  }
  return "/";
}

/**
 * Parse pathname into route.
 * Returns { section, tab, productId, langHint }
 */
function parsePath(pathname = location.pathname, langHint = "pl") {
  const clean = String(pathname || "/")
    .replace(/\/index\.html$/i, "/")
    .replace(/\/+$/, "") || "/";

  if (clean === "/" || clean === "") {
    return { section: "home", tab: null, productId: null };
  }

  const parts = clean.slice(1).split("/").filter(Boolean);
  const first = decodeURIComponent(parts[0] || "").toLowerCase();
  const second = parts[1] ? decodeURIComponent(parts[1]) : null;

  // Try current language first, then all languages
  const order = [normalizeLang(langHint), "pl", "en", "ru", "uk"];
  const tried = new Set();

  for (const lang of order) {
    if (tried.has(lang)) continue;
    tried.add(lang);
    const slugs = getSlugs(lang);

    if (first === slugs.cart) return { section: "cart", tab: null, productId: null, lang };
    if (first === slugs.product && second) {
      return { section: "product", tab: null, productId: second, lang };
    }
    if (first === slugs.upload) return { section: "custom", tab: "upload", productId: null, lang };
    if (first === slugs.calc) return { section: "custom", tab: "calc", productId: null, lang };
    if (first === slugs.shop) return { section: "shop", tab: null, productId: null, lang };
    if (first === slugs.models) return { section: "models", tab: null, productId: null, lang };
    if (first === slugs.dostawa) return { section: "dostawa", tab: null, productId: null, lang };
    if (first === slugs.contact) return { section: "contact", tab: null, productId: null, lang };
  }

  return { section: "home", tab: null, productId: null };
}

/** Old hash → new path (one-time migration) */
function migrateHashToPath(lang) {
  const hash = location.hash.replace(/^#/, "");
  if (!hash) return false;

  if (hash === "home") {
    history.replaceState(null, "", "/");
    return true;
  }
  if (hash === "cart") {
    history.replaceState(null, "", pathFor("cart", { lang }));
    return true;
  }
  if (hash.startsWith("product-")) {
    const id = hash.replace(/^product-/, "");
    history.replaceState(null, "", pathFor("product", { productId: id, lang }));
    return true;
  }
  if (hash === "custom") {
    history.replaceState(null, "", pathFor("custom", { tab: "upload", lang }));
    return true;
  }
  if (["shop", "models", "dostawa", "contact"].includes(hash)) {
    history.replaceState(null, "", pathFor(hash, { lang }));
    return true;
  }
  return false;
}

function updateNavHrefs(lang) {
  document.querySelectorAll("[data-section]").forEach((el) => {
    if (el.tagName !== "A") return;
    const section = el.dataset.section;
    const tab = el.dataset.tab || null;
    const href = pathFor(section === "custom" ? "custom" : section, { tab, lang });
    el.setAttribute("href", href);
  });
}

export {
  ROUTE_SLUGS,
  PANEL_SECTIONS,
  pathFor,
  parsePath,
  migrateHashToPath,
  updateNavHrefs,
  normalizeLang,
};
