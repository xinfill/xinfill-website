import { CONFIG } from "./config.js";

const MAX_SIZE = 50 * 1024 * 1024;
const ALLOWED = [".stl", ".3mf"];

let selectedFile = null;

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function isValidFile(file) {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  return ALLOWED.includes(ext) && file.size <= MAX_SIZE;
}

function showFile(file) {
  selectedFile = file;
  const preview = document.getElementById("file-preview");
  document.getElementById("file-name").textContent = file.name;
  document.getElementById("file-size").textContent = formatSize(file.size);
  preview.classList.add("visible");
}

function clearFile() {
  selectedFile = null;
  document.getElementById("file-preview").classList.remove("visible");
  document.getElementById("file-input").value = "";
}

function initUpload() {
  const zone = document.getElementById("upload-zone");
  const input = document.getElementById("file-input");
  const removeBtn = document.getElementById("file-remove");
  const form = document.getElementById("upload-form");

  if (CONFIG.email && !CONFIG.email.includes("example.com")) {
    form.action = `https://formsubmit.co/${CONFIG.email}`;
  }

  zone.addEventListener("click", () => input.click());

  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.classList.add("dragover");
  });

  zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));

  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file && isValidFile(file)) showFile(file);
  });

  input.addEventListener("change", () => {
    const file = input.files[0];
    if (file && isValidFile(file)) showFile(file);
  });

  removeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    clearFile();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const msgEl = document.getElementById("form-message");
    msgEl.className = "form-message";
    msgEl.style.display = "none";

    if (!selectedFile) {
      msgEl.textContent = "Dodaj plik STL lub 3MF przed wysłaniem.";
      msgEl.className = "form-message error";
      msgEl.style.display = "block";
      return;
    }

    const consent = document.getElementById("consent-checkbox");
    if (!consent?.checked) {
      msgEl.textContent = document.querySelector("[data-i18n='upload.consent_error']")?.textContent || "Zaakceptuj regulamin i politykę prywatności.";
      msgEl.className = "form-message error";
      msgEl.style.display = "block";
      return;
    }

    const formData = new FormData(form);
    formData.set("attachment", selectedFile);

    const submitBtn = document.getElementById("submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "...";

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        msgEl.textContent = document.querySelector("[data-i18n='upload.success']")?.textContent || "Zamówienie wysłane! Sprawdź swoją skrzynkę — odpowiemy z wyceną.";
        msgEl.className = "form-message success";
        msgEl.style.display = "block";
        form.reset();
        clearFile();
      } else {
        throw new Error("submit failed");
      }
    } catch {
      msgEl.textContent = document.querySelector("[data-i18n='upload.error']")?.textContent || "Wystąpił błąd. Wyślij zamówienie bezpośrednio na xinfilleu@gmail.com";
      msgEl.className = "form-message error";
      msgEl.style.display = "block";
    }

    submitBtn.disabled = false;
    submitBtn.textContent = document.querySelector("[data-i18n='upload.submit']")?.textContent || "Submit";
  });
}

export { initUpload };
