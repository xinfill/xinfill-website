import { CONFIG } from "./config.js";

const { ratesPer100g: RATES, minOrder: MIN_ORDER } = CONFIG;

function calculatePrice() {
  const material = document.getElementById("calc-material").value;
  const weight = parseFloat(document.getElementById("calc-weight").value) || 0;
  const quantity = parseInt(document.getElementById("calc-quantity").value) || 1;
  const infill = document.getElementById("calc-infill")?.value || 20;

  const resultEl = document.getElementById("calc-result");
  const priceEl = document.getElementById("calc-price");
  const detailEl = document.getElementById("calc-detail");

  if (weight <= 0) {
    resultEl.classList.remove("visible");
    return;
  }

  const rate = RATES[material];
  const perPiece = Math.max((weight / 100) * rate, MIN_ORDER / quantity);
  const total = perPiece * quantity;

  priceEl.textContent = `${total.toFixed(2)} PLN`;
  const perPieceLabel = document.querySelector("[data-i18n='calculator.per_piece']")?.textContent || "za sztukę";
  const materialLabel = document.getElementById("calc-material").selectedOptions[0]?.textContent || material;
  detailEl.textContent = `${perPiece.toFixed(2)} PLN (${perPieceLabel}) × ${quantity} | ${materialLabel} | ${weight} g | infill ${infill}%`;

  resultEl.classList.add("visible");
}

function initCalculator() {
  const btn = document.getElementById("calc-btn");
  if (btn) btn.addEventListener("click", calculatePrice);

  ["calc-material", "calc-weight", "calc-quantity", "calc-infill"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", calculatePrice);
  });
}

function initTabs() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("active", p.id === `tab-${tab}`));
    });
  });

  document.querySelectorAll("[data-open-tab]").forEach((el) => {
    el.addEventListener("click", () => {
      const tab = el.dataset.openTab;
      setTimeout(() => {
        document.querySelector(`.tab-btn[data-tab="${tab}"]`)?.click();
      }, 100);
    });
  });
}

export { initCalculator, initTabs, RATES };
