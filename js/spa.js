const PANEL_SECTIONS = ["shop", "models", "custom"];

function showSection(id, tab) {
  PANEL_SECTIONS.forEach((s) => {
    const el = document.getElementById(s);
    if (!el) return;
    el.hidden = s !== id;
  });

  if (id === "custom" && tab) {
    setTimeout(() => {
      const btn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
      btn?.click();
    }, 10);
  }

  // Update active panel
  document.querySelectorAll(".nav-panel").forEach((p) => {
    const pSection = p.dataset.section;
    const pTab = p.dataset.tab;
    const isMatch = pSection === id && (!pTab || pTab === tab);
    p.classList.toggle("active", isMatch);
  });

  // Update active nav link
  document.querySelectorAll(".nav a[data-section]").forEach((a) => {
    a.classList.toggle("active", a.dataset.section === id);
  });

  // Scroll to the visible section
  const target = document.getElementById(id);
  if (target) {
    setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }
}

function initSpa() {
  // Hide models and custom on load, show shop by default
  PANEL_SECTIONS.forEach((s) => {
    const el = document.getElementById(s);
    if (el) el.hidden = s !== "shop";
  });

  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-section]");
    if (!link) return;

    e.preventDefault();
    const section = link.dataset.section;
    const tab = link.dataset.tab || null;

    if (section === "home") {
      // Show shop, scroll to top
      showSection("shop", null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      history.replaceState(null, "", "#home");
      return;
    }

    if (PANEL_SECTIONS.includes(section)) {
      showSection(section, tab);
      history.replaceState(null, "", `#${section}`);
      return;
    }

    // For non-panel sections (dostawa, contact) just scroll to them
    const target = document.getElementById(section);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  // Handle scroll links (dostawa, contact in nav)
  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-scroll-to]");
    if (!link) return;
    e.preventDefault();
    const target = document.getElementById(link.dataset.scrollTo);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Handle initial hash
  const hash = location.hash.replace("#", "");
  if (hash && PANEL_SECTIONS.includes(hash) && hash !== "shop") {
    showSection(hash);
  }
}

export { initSpa };
