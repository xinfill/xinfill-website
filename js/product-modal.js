import { addToCart } from "./cart.js";
import { openStandalonePage, leaveStandalonePage } from "./view-chrome.js";

const PRODUCTS = {
  gadget: {
    magnet: {
      pl: "Kolorowe magnesy 3D na lodówkę. Zamawiasz zestaw lub pojedynczą sztukę. Wypełnienie jest standardowe — Ty wybierasz kolor (opcjonalnie personalizację).",
      en: "Colorful 3D fridge magnets. Order a set or single piece. Infill is standard — you choose the color (personalization optional).",
      ru: "Цветные 3D магниты для холодильника. Закажите набор или одну штуку. Заполнение стандартное — вы выбираете цвет.",
      uk: "Кольорові 3D магніти для холодильника. Замовляйте набір або одну штуку. Заповнення стандартне — ви обираєте колір.",
    },
    headphone: {
      pl: "Stand na słuchawki — stabilna podstawka na biurku. Wygląda dobrze w każdym pokoju, pomaga utrzymać porządek.",
      en: "Headphone stand — a stable desk holder. Looks great anywhere and keeps your setup tidy.",
      ru: "Подставка для наушников — стабильная основа на столе. Помогает поддерживать порядок.",
      uk: "Підставка для навушників — стабільна підкладка на столі. Тримайте порядок.",
    },
    keychain: {
      pl: "Brelok z otwieraczem do butelek. Praktyczny dodatek z Twoim ulubionym stylem.",
      en: "Keychain with a bottle opener. Practical accessory in your style.",
      ru: "Брелок с открывалкой для бутылок. Практично и стильно.",
      uk: "Брелок з відкривачкою для пляшок. Практично та стильно.",
    },
    whistle: {
      pl: "Gwizdek z imieniem zwierzaka. Podczas zamówienia wpisz imię — zrobimy personalizację pod Twój model.",
      en: "Pet name whistle. Add your pet’s name in the order message — we personalize it.",
      ru: "Свисток с именем питомца. Укажите имя в сообщении к заказу.",
      uk: "Свисток з ім’ям тваринки. Напишіть ім’я у повідомленні.",
    },
    coaster: {
      pl: "Podstawka na kubek — chroni blat i wygląda świetnie. Idealna do domu i biura.",
      en: "Cup coaster — protects your desk and looks great. Perfect for home and office.",
      ru: "Подставка под кружку — защищает поверхность и отлично выглядит.",
      uk: "Підставка під кружку — захищає поверхню та гарно виглядає.",
    },
    controller: {
      pl: "Stand na pada — wygodny uchwyt na kontroler do konsoli lub PC.",
      en: "Gamepad stand — convenient holder for your controller.",
      ru: "Подставка для геймпада — удобный держатель для контроллера.",
      uk: "Підставка для геймпада — зручний тримач для контролера.",
    },
    collar: {
      pl: "Przypinka na obrożę: imię psa + numer telefonu właściciela. Wpisz dane w personalizacji.",
      en: "Dog collar tag: pet name + owner phone number. Enter the details in personalization.",
      ru: "Бирка на ошейник: имя собаки + телефон владельца. Укажите данные в персонализации.",
      uk: "Підвіска на нашийник: ім’я собаки + телефон власника. Вкажіть дані у персоналізації.",
    },
    collar_nfc: {
      pl: "Przypinka z tagiem NFC: jak zwykła przypinka + dane kontaktowe w tagu. Wpisz dane w personalizacji.",
      en: "NFC collar tag: like a regular tag + contact data inside NFC. Enter the details.",
      ru: "Бирка NFC: как обычная + контактные данные в NFC. Укажите данные.",
      uk: "Підвіска NFC: як звичайна + контактні дані в NFC. Вкажіть дані.",
    },
    collar_airtag: {
      pl: "Przypinka na AirTag: miejsce na Apple AirTag w obroży. Wpisz dane i dopasujemy model pod wybór.",
      en: "AirTag collar tag: slot for Apple AirTag. Enter details and we’ll match the model.",
      ru: "Бирка для AirTag: место под Apple AirTag. Укажите данные — подберём модель.",
      uk: "Підвіска для AirTag: місце під Apple AirTag. Укажіть дані — підберемо модель.",
    },
    food: {
      pl: "Pojemnik na karmę z clickerem i imieniem psa. Wpisz imię — przygotujemy personalizację.",
      en: "Food container + clicker with your dog’s name. Add the name — we’ll personalize it.",
      ru: "Контейнер для корма + кликер с именем собаки. Укажите имя в заказе.",
      uk: "Контейнер для корму + клікер з ім’ям собаки. Напишіть ім’я.",
    },
  },
  model: {
    magnet: { pl: "Model STL/3MF do samodzielnego druku na Twojej drukarce.", en: "STL/3MF model for printing on your printer.", ru: "STL/3MF модель для печати на вашем принтере.", uk: "STL/3MF модель для друку на вашому принтері." },
    headphone: { pl: "Model STL/3MF do samodzielnego druku.", en: "STL/3MF model for printing.", ru: "STL/3MF для печати.", uk: "STL/3MF для друку." },
    keychain: { pl: "Model STL/3MF do samodzielnego druku.", en: "STL/3MF model for printing.", ru: "STL/3MF для печати.", uk: "STL/3MF для друку." },
    whistle: { pl: "Model STL/3MF — personalizację robisz u siebie.", en: "STL/3MF model — you personalize it yourself.", ru: "STL/3MF — персонализируйте у себя.", uk: "STL/3MF — персоналізуйте у себе." },
    coaster: { pl: "Model STL/3MF do samodzielnego druku.", en: "STL/3MF model for printing.", ru: "STL/3MF для печати.", uk: "STL/3MF для друку." },
    controller: { pl: "Model STL/3MF do samodzielnego druku.", en: "STL/3MF model for printing.", ru: "STL/3MF для печати.", uk: "STL/3MF для друку." },
    collar: { pl: "Model STL/3MF — personalizację robisz u siebie.", en: "STL/3MF — personalize on your side.", ru: "STL/3MF — персонализация у вас.", uk: "STL/3MF — персоналізація у вас." },
    collar_nfc: { pl: "Model STL/3MF — NFC i personalizację przygotowujesz u siebie.", en: "STL/3MF — NFC and personalization on your side.", ru: "STL/3MF — NFC вы настраиваете у себя.", uk: "STL/3MF — NFC налаштовуєте у себе." },
    collar_airtag: { pl: "Model STL/3MF — miejsce pod AirTag w gotowym wymiarze.", en: "STL/3MF — AirTag slot in ready dimensions.", ru: "STL/3MF — место под AirTag.", uk: "STL/3MF — слот під AirTag." },
    food: { pl: "Model STL/3MF — personalizację robisz u siebie.", en: "STL/3MF — personalize yourself.", ru: "STL/3MF — персонализация у вас.", uk: "STL/3MF — персоналізація у вас." },
  },
};

/** Gadgets sold with fixed standard infill (no client choice) */
const NO_INFILL_IDS = ["magnet"];

let current = null;
let returnSection = "shop";

function pickLang(obj) {
  const lang = (document.documentElement.lang || "pl").toLowerCase();
  const allowed = ["pl", "en", "ru", "uk"];
  const key = allowed.includes(lang) ? lang : "pl";
  return obj[key] || obj.pl || "";
}

function extractProductKeyFromCard(card) {
  const h3 = card.querySelector(".product-info h3");
  const dataI18n = h3?.dataset?.i18n;
  if (!dataI18n) return null;
  const [, rest] = String(dataI18n).split(".");
  const id = rest?.replace("_title", "");
  const type = card.classList.contains("model-card") ? "model" : "gadget";
  return { type, id };
}

function openProductPage(card) {
  const page = document.getElementById("product-page");
  if (!page) return;

  const key = extractProductKeyFromCard(card);
  if (!key?.id) return;

  returnSection = card.closest("#models") ? "models" : "shop";

  current = {
    ...key,
    title: card.querySelector(".product-info h3")?.textContent?.trim() || "",
  };

  const short = card.querySelector(".product-info p")?.textContent?.trim() || "";
  document.getElementById("product-modal-title").textContent = current.title;
  document.getElementById("product-modal-short").textContent = short;

  const info = PRODUCTS[current.type]?.[current.id];
  document.getElementById("product-modal-long").textContent = info ? pickLang(info) : "";

  const srcVisual = card.querySelector(".product-visual, .product-img");
  const destImg = document.getElementById("product-page-img");
  if (srcVisual && destImg) {
    destImg.className = srcVisual.className;
    const icon = srcVisual.querySelector(".pv-icon")?.textContent || "🛒";
    destImg.innerHTML = `<span class="pv-icon">${icon}</span>`;
  }

  const colorRadio = page.querySelector('input[name="product-color"][value="Czarny"]');
  if (colorRadio) colorRadio.checked = true;

  const qty = document.getElementById("product-qty");
  if (qty) qty.value = "1";

  const pers = document.getElementById("product-personalization");
  if (pers) pers.value = "";

  const isModel = current.type === "model";
  const noInfill = isModel || NO_INFILL_IDS.includes(current.id);

  page.querySelectorAll(".product-print-options").forEach((el) => {
    el.hidden = isModel;
  });
  const infillWrap = document.getElementById("product-infill-wrap");
  if (infillWrap) infillWrap.hidden = noInfill;

  const persWrap = document.getElementById("product-personalization-wrap");
  if (persWrap) persWrap.hidden = isModel;

  if (pers && !isModel) {
    const required = ["whistle", "collar", "collar_nfc", "collar_airtag", "food"].includes(current.id);
    pers.placeholder = required
      ? "Wpisz dane do personalizacji"
      : "Opcjonalnie: np. imię, napis";
  }

  const addBtn = document.getElementById("product-add-to-cart");
  if (addBtn) addBtn.textContent = isModel ? "Kup model (STL)" : "Dodaj do koszyka";

  openStandalonePage("product-page");
  history.replaceState(null, "", `#product-${current.id}`);
}

function closeProductPage() {
  leaveStandalonePage({ showSectionId: returnSection });
  current = null;
  history.replaceState(null, "", `#${returnSection}`);
}

function initProductModal() {
  const page = document.getElementById("product-page");
  if (!page) return;

  const closeBtn = document.getElementById("product-close");
  const addBtn = document.getElementById("product-add-to-cart");
  const qtyInput = document.getElementById("product-qty");
  const qtyMinus = document.getElementById("product-qty-minus");
  const qtyPlus = document.getElementById("product-qty-plus");
  const infill = document.getElementById("product-infill");

  closeBtn?.addEventListener("click", closeProductPage);

  qtyMinus?.addEventListener("click", () => {
    const v = Number(qtyInput.value || 1);
    qtyInput.value = String(Math.max(1, v - 1));
  });
  qtyPlus?.addEventListener("click", () => {
    const v = Number(qtyInput.value || 1);
    qtyInput.value = String(Math.min(50, v + 1));
  });

  infill?.addEventListener("input", () => {
    const v = infill.value;
    const label = document.getElementById("product-infill-val");
    if (label) label.textContent = `${v}%`;
    document.getElementById("product-infill-preview")?.style.setProperty("--infill-pct", v);
  });

  addBtn?.addEventListener("click", () => {
    if (!current) return;

    const qty = Number(document.getElementById("product-qty").value || 1);
    const isModel = current.type === "model";
    const noInfill = isModel || NO_INFILL_IDS.includes(current.id);

    const colorEl = page.querySelector('input[name="product-color"]:checked');
    const color = isModel ? "" : colorEl?.value || "";
    const infillVal = noInfill ? null : Number(document.getElementById("product-infill").value || 20);
    const personalization = isModel
      ? ""
      : document.getElementById("product-personalization")?.value || "";

    addToCart({
      type: current.type,
      id: current.id,
      title: current.title,
      qty,
      color,
      infill: infillVal,
      personalization,
    });

    closeProductPage();
    document.getElementById("cart-toggle")?.click();
  });

  document.addEventListener("click", (e) => {
    const card = e.target.closest(".product-card");
    if (!card) return;
    if (e.target.closest("#product-page")) return;

    const buyLink = e.target.closest("a.btn-buy-model");
    if (buyLink) e.preventDefault();

    openProductPage(card);
  });
}

export { initProductModal };
