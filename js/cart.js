import { CONFIG } from "./config.js";

const STORAGE_KEY = "xinfill-cart";
const PANEL_IDS = ["shop", "models", "custom", "dostawa", "contact", "product-page"];

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function normalizeItemKey(item) {
  return [
    item.type,
    item.id,
    item.color || "",
    item.infill ?? "",
    item.personalization || "",
  ].join("|");
}

function upsertItem(cart, item) {
  const key = normalizeItemKey(item);
  const existing = cart.find((x) => normalizeItemKey(x) === key);
  if (existing) {
    existing.qty += item.qty;
    return cart;
  }
  cart.push(item);
  return cart;
}

function renderCart(cart) {
  const itemsEl = document.getElementById("cart-items");
  const emptyEl = document.getElementById("cart-empty");
  const formEl = document.getElementById("cart-form");
  if (!itemsEl) return;

  if (!cart.length) {
    emptyEl?.classList.add("visible");
    itemsEl.innerHTML = "";
    formEl?.classList.add("hidden");
    return;
  }

  emptyEl?.classList.remove("visible");
  formEl?.classList.remove("hidden");

  itemsEl.innerHTML = cart
    .map((it, idx) => {
      const lines = [];
      if (it.color) lines.push(`Kolor: ${it.color}`);
      if (it.infill != null && it.infill !== "") lines.push(`Infill: ${it.infill}%`);
      if (it.personalization) lines.push(`Personalizacja: ${it.personalization}`);
      if (it.type === "model") lines.push("Typ: model STL/3MF");

      return `
        <div class="cart-item" data-cart-index="${idx}">
          <div class="cart-item-main">
            <div class="cart-item-title">${escapeHtml(it.title)}</div>
            <div class="cart-item-meta">${lines.join("<br>")}</div>
          </div>
          <div class="cart-item-actions">
            <div class="cart-qty">x${it.qty}</div>
            <button class="cart-remove" type="button" aria-label="Usuń">Usuń</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function updateCount(cart) {
  const countEl = document.getElementById("cart-count");
  if (!countEl) return;
  const total = cart.reduce((sum, it) => sum + (it.qty || 0), 0);
  countEl.textContent = String(total);
}

function openCartPage() {
  const page = document.getElementById("cart-page");
  if (!page) return;

  PANEL_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.hidden = true;
  });

  page.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
  history.replaceState(null, "", "#cart");
}

function closeCartPage() {
  const page = document.getElementById("cart-page");
  if (page) page.hidden = true;

  const shop = document.getElementById("shop");
  if (shop) shop.hidden = false;
  history.replaceState(null, "", "#shop");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function buildOrderEmail(cart, customer) {
  const lines = cart.map((it) => {
    const meta = [];
    if (it.type === "model") meta.push("Typ: model STL/3MF");
    if (it.color) meta.push(`Kolor: ${it.color}`);
    if (it.infill != null && it.infill !== "") meta.push(`Infill: ${it.infill}%`);
    if (it.personalization) meta.push(`Personalizacja: ${it.personalization}`);
    return `- ${it.title} (x${it.qty})\n  ${meta.join("\n  ")}`;
  });

  const body = [
    `Imię i nazwisko: ${customer.name || "-"}`,
    `E-mail: ${customer.email || "-"}`,
    `Telefon: ${customer.phone || "-"}`,
    "",
    "Zamówienie preorder xinfill (najpierw opłata, potem realizacja):",
    ...lines,
    "",
    `Wiadomość: ${customer.message || "-"}`,
    "",
    "Pakowanie: karton + folia jako wypełnienie.",
  ].join("\n");

  const subject = `Zamówienie preorder xinfill (${cart.reduce((s, it) => s + (it.qty || 0), 0)} szt.)`;
  return `mailto:${encodeURIComponent(CONFIG.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function initCart() {
  const page = document.getElementById("cart-page");
  const toggle = document.getElementById("cart-toggle");
  const closeBtn = document.getElementById("cart-close");
  const submitBtn = document.getElementById("cart-submit");

  if (!page || !toggle) return;

  let cart = loadCart();
  updateCount(cart);
  renderCart(cart);

  toggle.addEventListener("click", () => {
    cart = loadCart();
    updateCount(cart);
    renderCart(cart);
    openCartPage();
  });

  closeBtn?.addEventListener("click", closeCartPage);

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".cart-remove");
    if (!btn) return;
    const idx = Number(btn.closest(".cart-item")?.dataset.cartIndex ?? -1);
    if (idx < 0) return;
    cart = loadCart();
    cart.splice(idx, 1);
    saveCart(cart);
    updateCount(cart);
    renderCart(cart);
  });

  submitBtn?.addEventListener("click", () => {
    cart = loadCart();
    if (!cart.length) return;

    const customer = {
      name: document.getElementById("cart-name")?.value || "",
      email: document.getElementById("cart-email")?.value || "",
      phone: document.getElementById("cart-phone")?.value || "",
      message: document.getElementById("cart-message")?.value || "",
    };

    window.location.href = buildOrderEmail(cart, customer);
  });
}

function addToCart(item) {
  let cart = loadCart();
  cart = upsertItem(cart, item);
  saveCart(cart);
  updateCount(cart);
  renderCart(cart);
}

export { initCart, addToCart };
