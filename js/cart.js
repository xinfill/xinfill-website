import { CONFIG } from "./config.js";
import { t } from "./i18n.js";
import { openStandalonePage, leaveStandalonePage, showHomeChrome } from "./view-chrome.js";

const STORAGE_KEY = "xinfill-cart";
const DELIVERY_STORAGE_KEY = "xinfill-cart-delivery";
const MAX_QTY = 50;

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const cart = Array.isArray(parsed) ? parsed : [];
    return cart.map((it) => ({
      ...it,
      unitPrice: getProductUnitPrice(it.type, it.id) ?? it.unitPrice ?? null,
    }));
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function getProductUnitPrice(type, id) {
  return CONFIG.productPrices?.[type]?.[id] ?? null;
}

function formatPln(amount) {
  if (amount == null || Number.isNaN(amount)) return "—";
  return `${amount.toFixed(2).replace(".", ",")} zł`;
}

function getFreeShippingThreshold() {
  return CONFIG.freeShippingThreshold ?? 150;
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
    existing.qty = Math.min(MAX_QTY, existing.qty + item.qty);
    return cart;
  }
  cart.push({ ...item, qty: Math.min(MAX_QTY, item.qty || 1) });
  return cart;
}

function getSelectedDeliveryId() {
  const select = document.getElementById("cart-delivery");
  return select?.value || localStorage.getItem(DELIVERY_STORAGE_KEY) || CONFIG.deliveryOptions[0]?.id || "";
}

function getDeliveryOption(id) {
  return CONFIG.deliveryOptions.find((o) => o.id === id) || null;
}

function getDeliveryPrice(id) {
  return getDeliveryOption(id)?.price ?? 0;
}

function calcCartTotals(cart) {
  let productsTotal = 0;
  let hasUnknownPrice = false;

  for (const it of cart) {
    const unit = it.unitPrice ?? getProductUnitPrice(it.type, it.id);
    if (unit == null) {
      hasUnknownPrice = true;
      continue;
    }
    productsTotal += unit * (it.qty || 1);
  }

  const deliveryId = getSelectedDeliveryId();
  const shippingBase = cart.length ? getDeliveryPrice(deliveryId) : 0;
  const threshold = getFreeShippingThreshold();
  const freeShippingApplied = !hasUnknownPrice && productsTotal >= threshold;
  const shipping = freeShippingApplied ? 0 : shippingBase;
  const grandTotal = hasUnknownPrice ? null : productsTotal + shipping;
  const amountUntilFreeShipping =
    hasUnknownPrice || freeShippingApplied ? 0 : Math.max(0, threshold - productsTotal);

  return {
    productsTotal,
    shipping,
    shippingBase,
    grandTotal,
    hasUnknownPrice,
    deliveryId,
    freeShippingApplied,
    amountUntilFreeShipping,
    threshold,
  };
}

function renderDeliveryOptions() {
  const select = document.getElementById("cart-delivery");
  if (!select) return;

  const saved = localStorage.getItem(DELIVERY_STORAGE_KEY);
  select.innerHTML = CONFIG.deliveryOptions
    .map((opt) => {
      const label = t(opt.labelKey);
      return `<option value="${opt.id}">${label} — ${formatPln(opt.price)}</option>`;
    })
    .join("");

  if (saved && CONFIG.deliveryOptions.some((o) => o.id === saved)) {
    select.value = saved;
  }
}

function updateFreeShippingInfo(cart, totals) {
  const el = document.getElementById("cart-free-shipping-info");
  if (!el) return;

  if (!cart.length) {
    el.textContent = "";
    el.className = "cart-free-shipping-info";
    return;
  }

  if (totals.hasUnknownPrice) {
    el.textContent = t("cart.free_shipping_info").replace("{amount}", formatPln(totals.threshold));
    el.className = "cart-free-shipping-info";
    return;
  }

  if (totals.freeShippingApplied) {
    el.textContent = t("cart.free_shipping_applied");
    el.className = "cart-free-shipping-info applied";
    return;
  }

  el.textContent = t("cart.free_shipping_remaining").replace(
    "{amount}",
    formatPln(totals.amountUntilFreeShipping)
  );
  el.className = "cart-free-shipping-info";
}

function updateTotals(cart) {
  const totals = calcCartTotals(cart);
  const { productsTotal, shipping, grandTotal, hasUnknownPrice, freeShippingApplied } = totals;
  const subtotalEl = document.getElementById("cart-subtotal");
  const shippingEl = document.getElementById("cart-shipping-cost");
  const totalEl = document.getElementById("cart-total");
  const payBtn = document.getElementById("cart-pay-online");

  if (subtotalEl) {
    subtotalEl.textContent = hasUnknownPrice ? t("cart.price_on_request") : formatPln(productsTotal);
  }
  if (shippingEl) {
    if (!cart.length) shippingEl.textContent = "—";
    else if (freeShippingApplied) shippingEl.textContent = t("cart.free_shipping_label");
    else shippingEl.textContent = formatPln(shipping);
  }
  if (totalEl) {
    totalEl.textContent =
      !cart.length || hasUnknownPrice ? t("cart.price_on_request") : formatPln(grandTotal);
  }

  updateFreeShippingInfo(cart, totals);

  const canPayOnline =
    CONFIG.payments?.enabled &&
    CONFIG.payments?.stripePaymentLink &&
    cart.length &&
    !hasUnknownPrice &&
    grandTotal != null;

  if (payBtn) {
    payBtn.classList.toggle("hidden", !canPayOnline);
    if (canPayOnline) payBtn.href = CONFIG.payments.stripePaymentLink;
  }
}

function renderCart(cart) {
  const itemsEl = document.getElementById("cart-items");
  const emptyEl = document.getElementById("cart-empty");
  const formEl = document.getElementById("cart-form");
  if (!itemsEl) return;

  renderDeliveryOptions();

  if (!cart.length) {
    emptyEl?.classList.add("visible");
    itemsEl.innerHTML = "";
    formEl?.classList.add("hidden");
    updateTotals(cart);
    return;
  }

  emptyEl?.classList.remove("visible");
  formEl?.classList.remove("hidden");

  itemsEl.innerHTML = cart
    .map((it, idx) => {
      const lines = [];
      if (it.color) lines.push(`${t("cart.color")}: ${it.color}`);
      if (it.infill != null && it.infill !== "") lines.push(`${t("cart.infill")}: ${it.infill}%`);
      if (it.personalization) lines.push(`${t("cart.personalization")}: ${it.personalization}`);
      if (it.type === "model") lines.push(t("cart.model_type"));

      const unit = it.unitPrice ?? getProductUnitPrice(it.type, it.id);
      const lineTotal = unit != null ? unit * (it.qty || 1) : null;
      const priceLabel =
        lineTotal != null
          ? `${formatPln(lineTotal)}`
          : `<span class="cart-price-pending">${t("cart.price_on_request")}</span>`;

      return `
        <div class="cart-item" data-cart-index="${idx}">
          <div class="cart-item-main">
            <div class="cart-item-title">${escapeHtml(it.title)}</div>
            <div class="cart-item-meta">${lines.join("<br>")}</div>
          </div>
          <div class="cart-item-actions">
            <div class="cart-item-price">${priceLabel}</div>
            <div class="cart-qty-stepper">
              <button type="button" class="cart-qty-btn" data-action="minus" aria-label="${t("cart.decrease")}">−</button>
              <span class="cart-qty-val">${it.qty}</span>
              <button type="button" class="cart-qty-btn" data-action="plus" aria-label="${t("cart.increase")}">+</button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  updateTotals(cart);
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

function changeItemQty(idx, delta) {
  let cart = loadCart();
  if (idx < 0 || idx >= cart.length) return cart;

  cart[idx].qty = (cart[idx].qty || 1) + delta;
  if (cart[idx].qty <= 0) {
    cart.splice(idx, 1);
  } else if (cart[idx].qty > MAX_QTY) {
    cart[idx].qty = MAX_QTY;
  }

  saveCart(cart);
  updateCount(cart);
  renderCart(cart);
  return cart;
}

function formatCartText(cart) {
  const totals = calcCartTotals(cart);
  const { productsTotal, shipping, grandTotal, hasUnknownPrice, deliveryId, freeShippingApplied } =
    totals;
  const deliveryOpt = getDeliveryOption(deliveryId);
  const deliveryLabel = deliveryOpt ? t(deliveryOpt.labelKey) : deliveryId;
  const shippingLabel = freeShippingApplied
    ? t("cart.free_shipping_label")
    : formatPln(shipping);

  const lines = cart.map((it) => {
    const meta = [];
    if (it.type === "model") meta.push("model STL/3MF");
    if (it.color) meta.push(`kolor: ${it.color}`);
    if (it.infill != null && it.infill !== "") meta.push(`infill: ${it.infill}%`);
    if (it.personalization) meta.push(`personalizacja: ${it.personalization}`);
    const unit = it.unitPrice ?? getProductUnitPrice(it.type, it.id);
    const priceStr = unit != null ? `${formatPln(unit * (it.qty || 1))}` : "do wyceny";
    const metaStr = meta.length ? ` (${meta.join(", ")})` : "";
    return `${it.title} x${it.qty} — ${priceStr}${metaStr}`;
  });

  lines.push("");
  lines.push(`Dostawa: ${deliveryLabel} — ${shippingLabel}`);
  lines.push(`Produkty: ${hasUnknownPrice ? "do wyceny" : formatPln(productsTotal)}`);
  lines.push(`Razem: ${hasUnknownPrice ? "do wyceny (produkty) + dostawa" : formatPln(grandTotal)}`);

  return lines.join("\n");
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
  const deliverySelect = document.getElementById("cart-delivery");

  if (!page || !toggle) return;

  let cart = loadCart();
  updateCount(cart);
  renderCart(cart);

  deliverySelect?.addEventListener("change", () => {
    localStorage.setItem(DELIVERY_STORAGE_KEY, deliverySelect.value);
    cart = loadCart();
    updateTotals(cart);
  });

  toggle.addEventListener("click", () => {
    cart = loadCart();
    updateCount(cart);
    renderCart(cart);
    openCartPage();
  });

  closeBtn?.addEventListener("click", closeCartPage);

  document.addEventListener("click", (e) => {
    const qtyBtn = e.target.closest(".cart-qty-btn");
    if (qtyBtn) {
      const idx = Number(qtyBtn.closest(".cart-item")?.dataset.cartIndex ?? -1);
      if (idx < 0) return;
      const delta = qtyBtn.dataset.action === "plus" ? 1 : -1;
      cart = changeItemQty(idx, delta);
      return;
    }
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    cart = loadCart();
    if (!cart.length) return;

    const name = document.getElementById("cart-name")?.value?.trim() || "";
    const email = document.getElementById("cart-email")?.value?.trim() || "";
    const phone = document.getElementById("cart-phone")?.value?.trim() || "";
    const message = document.getElementById("cart-message")?.value?.trim() || "";
    const shippingAddress = document.getElementById("cart-shipping-address")?.value?.trim() || "";
    const deliveryId = getSelectedDeliveryId();
    const deliveryOpt = getDeliveryOption(deliveryId);
    const deliveryLabel = deliveryOpt ? t(deliveryOpt.labelKey) : deliveryId;
    const totals = calcCartTotals(cart);
    const { productsTotal, shipping, grandTotal, hasUnknownPrice, freeShippingApplied } = totals;
    const shippingLabel = freeShippingApplied
      ? t("cart.free_shipping_label")
      : formatPln(shipping);

    if (!name || !email || !shippingAddress) {
      if (msgEl) {
        msgEl.textContent = t("cart.error_required");
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
    formData.set("shipping_address", shippingAddress);
    formData.set("delivery", `${deliveryLabel} — ${shippingLabel}`);
    formData.set("products_total", hasUnknownPrice ? "do wyceny" : formatPln(productsTotal));
    formData.set("shipping_cost", shippingLabel);
    formData.set("order_total", hasUnknownPrice ? "do wyceny (produkty) + dostawa" : formatPln(grandTotal));
    formData.set("message", message || "-");
    formData.set("order", formatCartText(cart));
    formData.set("note", t("cart.preorder_note"));

    try {
      const res = await fetch(`https://formsubmit.co/ajax/${CONFIG.email}`, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (!res.ok) throw new Error("submit failed");

      if (msgEl) {
        msgEl.textContent = t("cart.success");
        msgEl.className = "form-message success";
        msgEl.style.display = "block";
      }

      saveCart([]);
      cart = [];
      updateCount(cart);
      renderCart(cart);
      form.reset();
      renderDeliveryOptions();
    } catch {
      if (msgEl) {
        msgEl.textContent = t("cart.error_submit").replace("{email}", CONFIG.email);
        msgEl.className = "form-message error";
        msgEl.style.display = "block";
      }
    }

    submitBtn.disabled = false;
    submitBtn.textContent = t("cart.submit");
  });
}

function addToCart(item) {
  const unitPrice = getProductUnitPrice(item.type, item.id);
  let cart = loadCart();
  cart = upsertItem(cart, { ...item, unitPrice });
  saveCart(cart);
  updateCount(cart);
  renderCart(cart);
}

function refreshCartUi() {
  const cart = loadCart();
  updateCount(cart);
  renderCart(cart);
}

export { initCart, addToCart, showHomeChrome, refreshCartUi };
