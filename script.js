const pages = ["home", "scan", "results", "history", "about"];
const navLinks = document.querySelectorAll(".nav-link");
const imageInput = document.getElementById("imageInput");
const dropzone = document.getElementById("dropzone");
const previewImage = document.getElementById("previewImage");
const uploadPlaceholder = document.getElementById("uploadPlaceholder");
const chooseBtn = document.getElementById("chooseBtn");
const clearBtn = document.getElementById("clearBtn");
const analyzeBtn = document.getElementById("analyzeBtn");
const fileStatus = document.getElementById("fileStatus");
let selectedFile = null;
let previewUrl = null;
let currentRecord = null;
let history = [];

function goTo(page) {
  pages.forEach(name => {
    const section = document.getElementById(`page-${name}`);
    if (section) section.classList.toggle("active", name === page);
  });
  navLinks.forEach(btn => btn.classList.toggle("active", btn.dataset.page === page || (page === "results" && btn.dataset.page === "scan")));
  window.scrollTo({top: 0, behavior: "smooth"});
}
navLinks.forEach(btn => btn.addEventListener("click", () => goTo(btn.dataset.page)));
document.querySelectorAll("[data-go]").forEach(btn => btn.addEventListener("click", () => goTo(btn.dataset.go)));

function resetImage() {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null;
  selectedFile = null;
  imageInput.value = "";
  previewImage.hidden = true;
  previewImage.removeAttribute("src");
  uploadPlaceholder.hidden = false;
  fileStatus.textContent = "No image selected.";
  analyzeBtn.disabled = true;
  clearBtn.disabled = true;
}
function handleFile(file) {
  if (!file) return;
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    fileStatus.textContent = "Please select a JPG, PNG, or WEBP image.";
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    fileStatus.textContent = "File is larger than 5 MB. Please choose a smaller image.";
    return;
  }
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  selectedFile = file;
  previewUrl = URL.createObjectURL(file);
  previewImage.src = previewUrl;
  previewImage.hidden = false;
  uploadPlaceholder.hidden = true;
  fileStatus.textContent = `${file.name} · ${(file.size / (1024 * 1024)).toFixed(2)} MB`;
  analyzeBtn.disabled = false;
  clearBtn.disabled = false;
}
chooseBtn.addEventListener("click", () => imageInput.click());
dropzone.addEventListener("click", (event) => {
  if (event.target !== chooseBtn) imageInput.click();
});
imageInput.addEventListener("change", event => handleFile(event.target.files[0]));
["dragenter", "dragover"].forEach(type => dropzone.addEventListener(type, event => {
  event.preventDefault(); dropzone.classList.add("dragging");
}));
["dragleave", "drop"].forEach(type => dropzone.addEventListener(type, event => {
  event.preventDefault(); dropzone.classList.remove("dragging");
}));
dropzone.addEventListener("drop", event => handleFile(event.dataTransfer.files[0]));
clearBtn.addEventListener("click", resetImage);

analyzeBtn.addEventListener("click", () => {
  if (!selectedFile || !previewUrl) return;
  currentRecord = {
    name: selectedFile.name,
    url: previewUrl,
    date: new Date().toLocaleString(),
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`
  };
  document.getElementById("resultImage").src = previewUrl;
  document.getElementById("resultFilename").textContent = selectedFile.name;
  document.getElementById("scanDate").textContent = `Preview created: ${currentRecord.date}`;
  goTo("results");
});
document.getElementById("newScanBtn").addEventListener("click", () => goTo("scan"));
document.getElementById("saveBtn").addEventListener("click", () => {
  if (!currentRecord) return;
  history.unshift({...currentRecord});
  renderHistory();
  goTo("history");
});
document.getElementById("clearHistoryBtn").addEventListener("click", () => {
  history = [];
  renderHistory();
});
function renderHistory() {
  const holder = document.getElementById("historyList");
  if (!history.length) {
    holder.innerHTML = `<div class="empty-state"><span>◷</span><h3>No saved scans yet</h3><p>Upload an image and save a demo report to see it here.</p><button class="outline-btn" data-go="scan">Start a Scan</button></div>`;
    holder.querySelector("[data-go='scan']").addEventListener("click", () => goTo("scan"));
    return;
  }
  holder.innerHTML = history.map((record, index) => `
    <div class="history-item">
      <img src="${record.url}" alt="Saved scan preview">
      <div><b>${escapeHtml(record.name)}</b><small>${escapeHtml(record.date)}</small></div>
      <span class="status-pill">Demo</span>
      <button class="outline-btn" data-index="${index}">View</button>
    </div>`).join("");
  holder.querySelectorAll("[data-index]").forEach(button => button.addEventListener("click", () => {
    currentRecord = history[Number(button.dataset.index)];
    document.getElementById("resultImage").src = currentRecord.url;
    document.getElementById("resultFilename").textContent = currentRecord.name;
    document.getElementById("scanDate").textContent = `Preview created: ${currentRecord.date}`;
    goTo("results");
  }));
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
