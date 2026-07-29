const HOME_CHROME = ["home", "nav-panels"];
const CONTENT_SECTIONS = ["shop", "models", "custom", "dostawa", "contact", "product-page", "cart-page"];

function setHidden(id, hidden) {
  const el = document.getElementById(id);
  if (el) el.hidden = hidden;
}

/** Hide logo animation + 4 panels — for full pages like cart / product */
function hideHomeChrome() {
  HOME_CHROME.forEach((id) => setHidden(id, true));
}

function showHomeChrome() {
  HOME_CHROME.forEach((id) => setHidden(id, false));
}

function hideAllContent() {
  CONTENT_SECTIONS.forEach((id) => setHidden(id, true));
}

function openStandalonePage(pageId) {
  hideHomeChrome();
  hideAllContent();
  setHidden(pageId, false);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function leaveStandalonePage({ showSectionId = null, showHome = false } = {}) {
  hideAllContent();
  showHomeChrome();
  if (showSectionId) {
    setHidden(showSectionId, false);
    revealFadeIns(document.getElementById(showSectionId));
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function revealFadeIns(root) {
  if (!root) return;
  root.querySelectorAll(".fade-in").forEach((el) => el.classList.add("visible"));
}

export { hideHomeChrome, showHomeChrome, hideAllContent, openStandalonePage, leaveStandalonePage };
