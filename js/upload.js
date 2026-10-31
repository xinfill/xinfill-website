import { CONFIG } from "./config.js";
import { t } from "./i18n.js";

// FormSubmit dołącza plik tylko przy zwykłym wysłaniu formularza i tylko do ok. 10 MB łącznie.
const MAX_SIZE = 9 * 1024 * 1024;
const ALLOWED = [".stl", ".3mf"];

let selectedFile = null;

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function fileProblem(file) {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!ALLOWED.includes(ext)) return "type";
  if (file.size > MAX_SIZE) return "size";
  return "";
}

function showProblem(kind) {
  const msgEl = document.getElementById("form-message");
  if (!msgEl) return;
  msgEl.textContent = kind === "size" ? t("upload.too_large") : t("upload.file_required");
  msgEl.className = "form-message error";
  msgEl.style.display = "block";
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
    if (!file) return;
    const problem = fileProblem(file);
    if (problem) {
      showProblem(problem);
      return;
    }
    showFile(file);
  });

  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;
    const problem = fileProblem(file);
    if (problem) {
      showProblem(problem);
      input.value = "";
      return;
    }
    showFile(file);
  });

  removeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    clearFile();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const msgEl = document.getElementById("form-message");
    const submitBtn = document.getElementById("submit-btn");
    msgEl.className = "form-message";
    msgEl.style.display = "none";

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (!selectedFile) {
      msgEl.textContent = t("upload.file_required");
      msgEl.className = "form-message error";
      msgEl.style.display = "block";
      return;
    }

    if (selectedFile.size > MAX_SIZE) {
      msgEl.textContent = t("upload.too_large");
      msgEl.className = "form-message error";
      msgEl.style.display = "block";
      return;
    }

    const attachment = document.getElementById("form-attachment");
    const bag = new DataTransfer();
    bag.items.add(selectedFile);
    attachment.files = bag.files;

    const reply = form.querySelector('[name="email"]')?.value || "";
    const replyField = form.querySelector('[name="_replyto"]');
    if (replyField) replyField.value = reply;

    form.action = `https://formsubmit.co/${CONFIG.email}`;
    form.method = "POST";
    form.enctype = "multipart/form-data";
    form.target = "xinfill-submit-frame";
    form.acceptCharset = "UTF-8";

    let frame = document.getElementById("xinfill-submit-frame");
    if (!frame) {
      frame = document.createElement("iframe");
      frame.id = "xinfill-submit-frame";
      frame.name = "xinfill-submit-frame";
      frame.hidden = true;
      frame.title = "Wysyłka formularza";
      document.body.appendChild(frame);
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "...";

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      frame.removeEventListener("load", finish);
      msgEl.textContent = t("upload.success");
      msgEl.className = "form-message success";
      msgEl.style.display = "block";
      form.reset();
      clearFile();
      submitBtn.disabled = false;
      submitBtn.textContent = t("upload.submit");
    };

    frame.addEventListener("load", finish);
    window.setTimeout(finish, 12000);
    form.submit();
  });
}

export { initUpload };
