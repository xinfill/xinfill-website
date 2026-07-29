import { CONFIG } from "./config.js";
import { openStandalonePage, leaveStandalonePage, showHomeChrome } from "./view-chrome.js";

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

function formatCartText(cart) {
  return cart
    .map((it) => {
      const meta = [];
      if (it.type === "model") meta.push("model STL/3MF");
      if (it.color) meta.push(`kolor: ${it.color}`);
      if (it.infill != null && it.infill !== "") meta.push(`infill: ${it.infill}%`);
      if (it.personalization) meta.push(`personalizacja: ${it.personalization}`);
      const metaStr = meta.length ? ` (${meta.join(", ")})` : "";
      return `${it.title} x${it.qty}${metaStr}`;
    })
    .join("\n");
}

function openCartPage() {
  openStandalonePage("cart-page");
  history.replaceState(null, "", "#cart");
}

function closeCartPage() {
  leaveStandalonePage({ showSectionId: "shop" });
  history.replaceState(null, "", "#shop");
}

function initCart() {
  const page = document.getElementById("cart-page");
  const toggle = document.getElementById("cart-toggle");
  const closeBtn = document.getElementById("cart-close");
  const form = document.getElementById("cart-order-form");
  const submitBtn = document.getElementById("cart-submit");
  const msgEl = document.getElementById("cart-message-status");

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

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    cart = loadCart();
    if (!cart.length) return;

    const name = document.getElementById("cart-name")?.value?.trim() || "";
    const email = document.getElementById("cart-email")?.value?.trim() || "";
    const phone = document.getElementById("cart-phone")?.value?.trim() || "";
    const message = document.getElementById("cart-message")?.value?.trim() || "";

    if (!name || !email) {
      if (msgEl) {
        msgEl.textContent = "Podaj imię i nazwisko oraz e-mail.";
        msgEl.className = "form-message error";
        msgEl.style.display = "block";
      }
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "...";
    if (msgEl) msgEl.style.display = "none";

    const formData = new FormData();
    formData.set("_subject", `Zamówienie koszyk xinfill (${cart.reduce((s, it) => s + (it.qty || 0), 0)} szt.)`);
    formData.set("_captcha", "false");
    formData.set("_template", "table");
    formData.set("_replyto", email);
    formData.set("name", name);
    formData.set("email", email);
    formData.set("phone", phone || "-");
    formData.set("message", message || "-");
    formData.set("order", formatCartText(cart));
    formData.set("note", "Preorder — najpierw płatność, potem realizacja (~2 tygodnie).");

    try {
      const res = await fetch(`https://formsubmit.co/ajax/${CONFIG.email}`, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (!res.ok) throw new Error("submit failed");

      if (msgEl) {
        msgEl.textContent = "Zamówienie wysłane na xinfilleu@gmail.com! Odezwiemy się z wyceną (bez otwierania programu pocztowego).";
        msgEl.className = "form-message success";
        msgEl.style.display = "block";
      }

      saveCart([]);
      cart = [];
      updateCount(cart);
      renderCart(cart);
      form.reset();
    } catch {
      if (msgEl) {
        msgEl.textContent = `Błąd wysyłki. Sprawdź czy FormSubmit jest aktywowany na ${CONFIG.email} (pierwszy mail z linkiem Activate).`;
        msgEl.className = "form-message error";
        msgEl.style.display = "block";
      }
    }

    submitBtn.disabled = false;
    submitBtn.textContent = "Wyślij zamówienie";
  });
}

function addToCart(item) {
  let cart = loadCart();
  cart = upsertItem(cart, item);
  saveCart(cart);
  updateCount(cart);
  renderCart(cart);
}

export { initCart, addToCart, showHomeChrome };
