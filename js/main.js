import { CONFIG } from "./config.js";
import { initI18n } from "./i18n.js";
import { initCalculator, initTabs } from "./calculator.js";
import { initUpload } from "./upload.js";
import { initInfillSliders, initColorPickers } from "./ui.js";
import { initCart, refreshCartUi } from "./cart.js";
import { initProductModal } from "./product-modal.js";
import { initCustomModal } from "./custom-modal.js";
import { initSpa } from "./spa.js";

function initNav() {
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("nav");

  toggle?.addEventListener("click", () => nav.classList.toggle("open"));

  document.querySelectorAll(".nav a").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("open"));
  });
}

function initContact() {
  const { email, social } = CONFIG;

  document.querySelectorAll("[data-contact-email]").forEach((el) => {
    el.textContent = email;
    if (el.tagName === "A") el.href = `mailto:${email}`;
  });

  const socialMap = {
    instagram: social.instagram,
    facebook: social.facebook,
    youtube: social.youtube,
    telegram: social.telegram,
  };

  document.querySelectorAll("[data-social]").forEach((el) => {
    const platform = el.dataset.social;
    if (socialMap[platform]) {
      el.href = socialMap[platform];
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    }
  });

  document.querySelectorAll("[data-social-handle]").forEach((el) => {
    el.textContent = social.handle;
  });
}

function initCookies() {
  const banner = document.getElementById("cookie-banner");
  const accept = document.getElementById("cookie-accept");
  if (!banner || !accept) return;

  const syncBannerOffset = () => {
    document.body.classList.toggle("has-cookie-banner", !banner.hidden);
  };

  if (!localStorage.getItem("xinfill-cookies")) {
    banner.hidden = false;
  }
  syncBannerOffset();

  accept.addEventListener("click", () => {
    localStorage.setItem("xinfill-cookies", "1");
    banner.hidden = true;
    syncBannerOffset();
  });
}

function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));
}

document.addEventListener("DOMContentLoaded", () => {
  initContact();
  initCookies();
  initI18n();
  initCalculator();
  initTabs();
  initUpload();
  initInfillSliders();
  initColorPickers();
  initNav();
  initCart();
  initProductModal();
  initCustomModal();
  initSpa();
  initScrollAnimations();
  document.addEventListener("xinfill-i18n-ready", () => refreshCartUi());
});
