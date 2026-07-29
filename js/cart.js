import { CONFIG } from "./config.js";

const STORAGE_KEY = "xinfill-cart";

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
  // Same product + same options => merge quantity.
  return [
    item.type,
    item.id,
    item.color || "",
    item.infill || 0,
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
      if (it.infill) lines.push(`Infill: ${it.infill}%`);
      if (it.personalization) lines.push(`Personalizacja: ${it.personalization}`);

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

function openDrawer() {
  const overlay = document.getElementById("cart-overlay");
  const drawer = document.getElementById("cart-drawer");
  if (!overlay || !drawer) return;
  overlay.hidden = false;
  drawer.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeDrawer() {
  const overlay = document.getElementById("cart-overlay");
  const drawer = document.getElementById("cart-drawer");
  if (!overlay || !drawer) return;
  overlay.hidden = true;
  drawer.hidden = true;
  document.body.style.overflow = "";
}

function buildOrderEmail(cart, customer) {
  const lines = cart.map((it) => {
    const meta = [];
    if (it.color) meta.push(`Kolor: ${it.color}`);
    if (it.infill) meta.push(`Infill: ${it.infill}%`);
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
  const to = CONFIG.email;

  const url = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    body
  )}`;

  return url;
}

function initCart() {
  const overlay = document.getElementById("cart-overlay");
  const drawer = document.getElementById("cart-drawer");
  const toggle = document.getElementById("cart-toggle");
  const closeBtn = document.getElementById("cart-close");
  const submitBtn = document.getElementById("cart-submit");

  if (!overlay || !drawer || !toggle) return;

  let cart = loadCart();
  updateCount(cart);
  renderCart(cart);

  toggle.addEventListener("click", () => {
    cart = loadCart();
    updateCount(cart);
    renderCart(cart);
    openDrawer();
  });

  overlay.addEventListener("click", closeDrawer);
  closeBtn?.addEventListener("click", closeDrawer);

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

    const url = buildOrderEmail(cart, customer);
    window.location.href = url;
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

