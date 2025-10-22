// List of all PDF files
import { pdfFiles } from "./data.js";

let currentPdf = null;

// Mobile menu functions
function toggleMobileMenu() {
  const sidebar = document.querySelector(".sidebar");
  const mobileOverlay = document.getElementById("mobileOverlay");
  sidebar.classList.toggle("active");
  mobileOverlay.classList.toggle("active");
}

function closeMobileMenu() {
  const sidebar = document.querySelector(".sidebar");
  const mobileOverlay = document.getElementById("mobileOverlay");
  sidebar.classList.remove("active");
  mobileOverlay.classList.remove("active");
}

// Render PDF list
function renderPdfList(categories = pdfFiles) {
  const pdfListElement = document.getElementById("pdfList");
  pdfListElement.innerHTML = "";

  categories.forEach((categoryObj) => {
    const categoryHeader = document.createElement("div");
    categoryHeader.className = "category-header";
    categoryHeader.innerHTML = `${categoryObj.category} <span class="pdf-count">${categoryObj.pdfs.length}</span>`;
    pdfListElement.appendChild(categoryHeader);

    categoryObj.pdfs.forEach((pdf) => {
      const item = document.createElement("div");
      item.className = "pdf-item";
      item.innerHTML = `
                <span class="pdf-icon">📄</span>
                <span class="pdf-name">${pdf.name}</span>
            `;
      item.onclick = () => loadPdf(pdf);
      pdfListElement.appendChild(item);
    });
  });
}

// Load PDF in viewer
function loadPdf(pdf) {
  currentPdf = pdf;
  // Handle file paths with category folders - encode each part separately
  const fileParts = pdf.file.split("/");
  const encodedParts = fileParts.map((part) => encodeURIComponent(part));
  const pdfPath = `pdf/${encodedParts.join("/")}`;

  // Update active state
  document.querySelectorAll(".pdf-item").forEach((item) => {
    item.classList.remove("active");
  });
  event.currentTarget.classList.add("active");

  // Update viewer title
  document.getElementById("viewerTitle").textContent = pdf.name;

  // Show action buttons
  const downloadBtn = document.getElementById("downloadBtn");
  const openNewTabBtn = document.getElementById("openNewTabBtn");
  downloadBtn.style.display = "inline-block";
  openNewTabBtn.style.display = "inline-block";
  downloadBtn.href = pdfPath;
  // Use just the filename for download, not the full path
  const filename = pdf.file.split("/").pop();
  downloadBtn.download = filename;
  openNewTabBtn.href = pdfPath;

  // Load PDF in iframe
  const viewerContent = document.getElementById("viewerContent");
  viewerContent.innerHTML = `<iframe src="${pdfPath}" class="pdf-viewer" title="${pdf.name}"></iframe>`;

  // Close mobile menu when a PDF is selected (on mobile)
  if (window.innerWidth <= 768) {
    closeMobileMenu();
  }
}

// Search functionality
document.getElementById("searchInput").addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();

  // Filter categories and PDFs based on search term
  const filtered = pdfFiles
    .map((categoryObj) => {
      // Check if category name matches
      const categoryMatches = categoryObj.category
        .toLowerCase()
        .includes(searchTerm);

      // Filter PDFs within this category
      const filteredPdfs = categoryObj.pdfs.filter((pdf) =>
        pdf.name.toLowerCase().includes(searchTerm)
      );

      // Include category if it matches or has matching PDFs
      if (categoryMatches || filteredPdfs.length > 0) {
        return {
          category: categoryObj.category,
          pdfs: categoryMatches ? categoryObj.pdfs : filteredPdfs,
        };
      }
      return null;
    })
    .filter((item) => item !== null);

  renderPdfList(filtered);
});

// Setup mobile menu event listeners
document
  .getElementById("mobileToggle")
  .addEventListener("click", toggleMobileMenu);
document
  .getElementById("mobileOverlay")
  .addEventListener("click", closeMobileMenu);

// Initialize the page
renderPdfList();
