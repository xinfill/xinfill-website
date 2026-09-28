import { addToCart } from "./cart.js";
import { openStandalonePage, leaveStandalonePage } from "./view-chrome.js";
import { pathFor } from "./routes.js";
import { getCurrentLang } from "./i18n.js";

const PRODUCTS = {
  gadget: {
    lipstick_case: {
      pl: "Etui na pomadkę z fakturą i sercem na wieczku. Drukowane w PLA — lekkie, zamykane na gwint, idealne do torebki albo na toaletkę. Na zdjęciach: czarny, fuksja i fiolet. Inny kolor dopisz w zamówieniu.",
      en: "A textured lipstick case with a heart lid. Printed in PLA — light, screw-top closure, great for a bag or a vanity. Photos show black, fuchsia and purple. Ask for another color in the order.",
      ru: "Текстурный футляр для помады с сердечком на крышке. Печать PLA — лёгкий, закрывается на резьбу, в сумку или на туалетный столик. На фото: чёрный, фуксия и фиолетовый.",
      uk: "Текстурний футляр для помади із сердечком на кришці. Друк PLA — легкий, закривається на різьбу, у сумку або на туалетний столик. На фото: чорний, фуксія та фіолетовий.",
    },
    supplement_box: {
      pl: "Okrągłe pudełko na suplementy z zakręcanym wieczkiem i trzema przegródkami. Witaminy, tabletki i drobiazgi w jednym miejscu — bez mieszania się w torebce czy plecaku.",
      en: "A round supplement box with a screw lid and three compartments. Vitamins, tablets and small bits stay sorted — nothing mixed in the bag.",
      ru: "Круглая коробочка для БАДов с крышкой и тремя отделениями. Витамины и таблетки лежат отдельно, ничего не смешивается.",
      uk: "Кругла коробочка для добавок із кришкою і трьома відділеннями. Вітаміни та таблетки лежать окремо, нічого не змішується.",
    },
    pen_holder: {
      pl: "Okrągły, żebrowany kubek / organizer na biurko. Idealny na długopisy, ołówki, pędzle do makijażu lub drobne akcesoria biurowe. Stabilny, trwały i estetyczny wydruk 3D.",
      en: "Round ribbed desk cup / organizer. Ideal for pens, pencils, makeup brushes or office accessories. Stable, durable and sleek 3D print.",
      ru: "Круглый ребристый стакан-органайзер для стола. Идеально подходит для ручек, карандашей, кистей или мелочей.",
      uk: "Круглий ребристий стакан-органайзер для столу. Ідеально підходить для ручок, олівців, пензлів або дрібниць.",
    },
    cotton_holder: {
      pl: "Żebrowany pojemnik z wygodnym bocznym wycięciem — zaprojektowany jako podajnik na płatki kosmetyczne lub organizer na drobiazgi na toaletkę i do łazienki.",
      en: "Ribbed cylindrical holder with a convenient side cutout — designed as a cotton pad dispenser or vanity organizer for bathroom and desk essentials.",
      ru: "Ребристый органайзер с удобным боковым вырезом — идеально подходит для ватных дисков или косметических мелочей.",
      uk: "Ребристий органайзер зі зручним бічним вирізом — ідеально підходить для ватних дисків або косметичних дрібниць.",
    },
    square_vase: {
      pl: "Minimalistyczny pojemnik kwadratowy z pionowym żebrowaniem. Świetnie sprawdza się jako nowoczesny organizer na biurko, osłonka lub wazon na suche kompozycje.",
      en: "Minimalist square container with vertical ribbing. Works great as a modern desk organizer, planter cover or vase for dried arrangements.",
      ru: "Минималистичный квадратный органайзер с вертикальным рифлением. Подойдёт для рабочего стола или сухих цветов.",
      uk: "Мінімалістичний квадратний органайзер із вертикальним рифленням. Підійде для робочого столу або сухоцвітів.",
    },
    soap_dish: {
      pl: "Owalna podstawka / mydelniczka z żebrowanym brzegiem i wewnętrznymi wypustkami odprowadzającymi wodę. Doskonała do łazienki na mydło w kostce, gąbkę lub jako tacka na biżuterię.",
      en: "Oval tray / soap dish with a ribbed rim and raised inner ridges for drainage. Perfect for bar soap, sponges or as a jewelry tray.",
      ru: "Овальная мыльница / подставка с ребристым бортиком и выступами внутри. Отлично подходит для мыла, губки или украшений.",
      uk: "Овальна мильниця / підставка з ребристим бортиком і виступами всередині. Чудово підходить для мила, губки або прикрас.",
    },
    flower_vase: {
      pl: "Dekoracyjny wazon z unikalną plecioną teksturą. Nowoczesna forma, która przyciąga wzrok i pasuje zarówno do kwiatów suszonych, jak i ciętych.",
      en: "Decorative vase with a unique braided chevron texture. A modern statement piece suitable for both dried and fresh flowers.",
      ru: "Декоративная ваза с уникальной плетёной текстурой. Современный акцент для сухоцветов и живых цветов.",
      uk: "Декоративна ваза з унікальною плетеною текстурою. Сучасний акцент для сухоцвітів і живих квітів.",
    },
  },
  model: {
    lipstick_case: {
      pl: "Model STL/3MF etui na pomadkę z sercem — do samodzielnego druku na Twojej drukarce 3D.",
      en: "STL/3MF lipstick case with heart lid — print it on your own 3D printer.",
      ru: "STL/3MF футляр для помады — печать на вашем принтере.",
      uk: "STL/3MF футляр для помади — друк на вашому принтері.",
    },
    supplement_box: {
      pl: "Model STL/3MF pudełka na suplementy (3 przegródki + zakręcane wieczko) — do samodzielnego druku.",
      en: "STL/3MF supplement box (3 compartments + lid) — print it yourself.",
      ru: "STL/3MF коробочка для БАДов (3 отделения) — печать у себя.",
      uk: "STL/3MF коробочка для добавок (3 відділення) — друк у себе.",
    },
    pen_holder: {
      pl: "Model STL/3MF okrągłego żebrowanego organizera na długopisy — gotowy do druku 3D.",
      en: "STL/3MF round ribbed pen holder — ready for 3D printing.",
      ru: "STL/3MF круглый ребристый органайзер для ручек — для печати у себя.",
      uk: "STL/3MF круглий ребристий органайзер для ручок — для друку у себе.",
    },
    cotton_holder: {
      pl: "Model STL/3MF podajnika na płatki kosmetyczne z wycięciem — do samodzielnego druku.",
      en: "STL/3MF cotton pad holder with side cutout — print it yourself.",
      ru: "STL/3MF органайзер для ватных дисков с вырезом — для печати у себя.",
      uk: "STL/3MF органайзер для ватних дисків із вирізом — для друку у себе.",
    },
    square_vase: {
      pl: "Model STL/3MF kwadratowego pojemnika żebrowanego — do samodzielnego druku.",
      en: "STL/3MF square ribbed container — print it on your own printer.",
      ru: "STL/3MF квадратный ребристый органайзер — для печати у себя.",
      uk: "STL/3MF квадратний ребристий органайзер — для друку у себе.",
    },
    soap_dish: {
      pl: "Model STL/3MF owalnej mydelniczki / podstawki — do samodzielnego druku 3D.",
      en: "STL/3MF oval soap dish / tray — print it on your own 3D printer.",
      ru: "STL/3MF овальная мыльница / подставка — для печати у себя.",
      uk: "STL/3MF овальна мильниця / підставка — для друку у себе.",
    },
    flower_vase: {
      pl: "Model STL/3MF wazonu na kwiaty z plecioną fakturą — do samodzielnego druku.",
      en: "STL/3MF braided texture flower vase — print it yourself.",
      ru: "STL/3MF ваза для цветов с плетёной текстурой — для печати у себя.",
      uk: "STL/3MF ваза для квітів із плетеною текстурою — для друку у себе.",
    },
  },
};

/** Gadgets and models use standard infill — no client slider */

let current = null;
let returnSection = "shop";

function pickLang(obj) {
  const lang = (document.documentElement.lang || "pl").toLowerCase();
  const allowed = ["pl", "en", "ru", "uk"];
  const key = allowed.includes(lang) ? lang : "pl";
  return obj[key] || obj.pl || "";
}

function normalizeImgSrc(src) {
  const clean = String(src || "").trim();
  if (!clean) return "";
  if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("/")) {
    return clean;
  }
  return `/${clean.replace(/^\.?\//, "")}`;
}

function extractProductKeyFromCard(card) {
  const type = card.classList.contains("model-card") ? "model" : "gadget";
  if (card.dataset.productId) {
    return { type, id: card.dataset.productId };
  }
  const h3 = card.querySelector(".product-info h3");
  const dataI18n = h3?.dataset?.i18n;
  if (dataI18n) {
    const [, rest] = String(dataI18n).split(".");
    const id = rest?.replace("_title", "");
    if (id) return { type, id };
  }
  const fallbackTitle = h3?.textContent?.trim() || "";
  if (fallbackTitle) {
    const slug = fallbackTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, "_")
      .replace(/^_+|_+$/g, "");
    return { type, id: slug || "custom_item" };
  }
  return null;
}

function galleryFromCard(card) {
  const listed = (card.dataset.images || "")
    .split("|")
    .map((s) => normalizeImgSrc(s))
    .filter(Boolean);
  if (listed.length) return listed;
  const src = card.querySelector(".product-photo img, .product-img img")?.getAttribute("src");
  return src ? [normalizeImgSrc(src)] : [];
}

function renderProductGallery(card, title) {
  const destImg = document.getElementById("product-page-img");
  const thumbs = document.getElementById("product-thumbs");
  if (!destImg) return;

  const images = galleryFromCard(card);
  const alt = title || "";

  if (images.length) {
    destImg.className = "product-img product-photo";
    destImg.innerHTML = `<img src="${images[0]}" alt="${alt}">`;
  } else {
    const srcVisual = card.querySelector(".product-visual, .product-img");
    destImg.className = srcVisual?.className || "product-img product-visual";
    const icon = srcVisual?.querySelector(".pv-icon")?.textContent || "🛒";
    destImg.innerHTML = `<span class="pv-icon">${icon}</span>`;
  }

  if (!thumbs) return;
  if (images.length < 2) {
    thumbs.hidden = true;
    thumbs.innerHTML = "";
    return;
  }

  thumbs.hidden = false;
  thumbs.innerHTML = images
    .map(
      (src, i) =>
        `<button type="button" class="product-thumb${i === 0 ? " is-active" : ""}" data-src="${src}" aria-label="${i + 1}">
           <img src="${src}" alt="">
         </button>`
    )
    .join("");
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
  document.getElementById("product-modal-long").textContent = info ? pickLang(info) : short;

  renderProductGallery(card, current.title);

  const colorRadio = page.querySelector('input[name="product-color"][value="Czarny"]');
  if (colorRadio) colorRadio.checked = true;

  const qty = document.getElementById("product-qty");
  if (qty) qty.value = "1";

  const pers = document.getElementById("product-personalization");
  if (pers) pers.value = "";

  const isModel = current.type === "model";

  page.querySelectorAll(".product-print-options").forEach((el) => {
    el.hidden = isModel;
  });
  const infillWrap = document.getElementById("product-infill-wrap");
  if (infillWrap) infillWrap.hidden = true;

  const persWrap = document.getElementById("product-personalization-wrap");
  const needsPers = ["whistle", "collar", "collar_nfc", "collar_airtag", "food"].includes(current.id);
  if (persWrap) persWrap.hidden = isModel || !needsPers;

  if (pers && !isModel) {
    const required = ["whistle", "collar", "collar_nfc", "collar_airtag", "food"].includes(current.id);
    pers.placeholder = required
      ? "Wpisz dane do personalizacji"
      : "Opcjonalnie: np. imię, napis";
  }

  const addBtn = document.getElementById("product-add-to-cart");
  if (addBtn) addBtn.textContent = isModel ? "Kup model (STL)" : "Dodaj do koszyka";

  openStandalonePage("product-page");
  const lang = getCurrentLang();
  history.replaceState(
    { section: "product", productId: current.id },
    "",
    pathFor("product", { productId: current.id, lang })
  );
}

function closeProductPage() {
  leaveStandalonePage({ showSectionId: returnSection });
  current = null;
  const lang = getCurrentLang();
  history.replaceState(
    { section: returnSection },
    "",
    pathFor(returnSection, { lang })
  );
}

function openProductById(productId, preferredType = null) {
  const selectors = [];
  if (preferredType === "model") {
    selectors.push(
      `#models .product-card[data-product-id="${productId}"]`,
      `#models .product-card [data-i18n="models.${productId}_title"]`
    );
  } else if (preferredType === "gadget") {
    selectors.push(
      `#shop .product-card[data-product-id="${productId}"]`,
      `#shop .product-card [data-i18n="shop.${productId}_title"]`
    );
  }
  selectors.push(
    `#shop .product-card[data-product-id="${productId}"]`,
    `#models .product-card[data-product-id="${productId}"]`,
    `#shop .product-card [data-i18n="shop.${productId}_title"]`,
    `#models .product-card [data-i18n="models.${productId}_title"]`
  );

  for (const sel of selectors) {
    const el = document.querySelector(sel);
    const card = el?.closest(".product-card");
    if (card) {
      openProductPage(card);
      return true;
    }
  }
  return false;
}

function initProductModal() {
  const page = document.getElementById("product-page");
  if (!page) return;

  const closeBtn = document.getElementById("product-close");
  const addBtn = document.getElementById("product-add-to-cart");
  const qtyInput = document.getElementById("product-qty");
  const qtyMinus = document.getElementById("product-qty-minus");
  const qtyPlus = document.getElementById("product-qty-plus");
  const thumbs = document.getElementById("product-thumbs");

  closeBtn?.addEventListener("click", closeProductPage);

  thumbs?.addEventListener("click", (e) => {
    const btn = e.target.closest(".product-thumb");
    if (!btn) return;
    const src = btn.dataset.src;
    const img = document.querySelector("#product-page-img img");
    if (img && src) img.src = src;
    thumbs.querySelectorAll(".product-thumb").forEach((el) => {
      el.classList.toggle("is-active", el === btn);
    });
  });

  qtyMinus?.addEventListener("click", () => {
    const v = Number(qtyInput.value || 1);
    qtyInput.value = String(Math.max(1, v - 1));
  });
  qtyPlus?.addEventListener("click", () => {
    const v = Number(qtyInput.value || 1);
    qtyInput.value = String(Math.min(50, v + 1));
  });

  addBtn?.addEventListener("click", () => {
    if (!current) return;

    const qty = Number(document.getElementById("product-qty").value || 1);
    const isModel = current.type === "model";

    const colorEl = page.querySelector('input[name="product-color"]:checked');
    let color = isModel ? "" : colorEl?.value || "";
    if (!isModel && color === "Inny") {
      const custom = document.getElementById("product-color-custom")?.value?.trim();
      color = custom ? `Inny: ${custom}` : "Inny";
    }
    const personalization = isModel
      ? ""
      : document.getElementById("product-personalization")?.value || "";

    addToCart({
      type: current.type,
      id: current.id,
      title: current.title,
      qty,
      color,
      infill: null,
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

export { initProductModal, openProductById };
