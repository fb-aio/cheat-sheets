const fs = require("fs");
const path = require("path");

// Paths
const PDF_DIR = path.join(__dirname, "../pdf");
const DATA_FILE = path.join(__dirname, "../src/data.js");

/**
 * Recursively scan directory for PDF files
 * @param {string} dir - Directory to scan
 * @param {string} category - Category name (parent folder)
 * @returns {Array} Array of PDF file objects
 */
function scanDirectory(dir, category = "") {
  const results = [];

  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      // Skip hidden files and DS_Store
      if (item.name.startsWith(".")) {
        continue;
      }

      if (item.isDirectory()) {
        // Recursively scan subdirectories
        const subResults = scanDirectory(fullPath, item.name);
        results.push(...subResults);
      } else if (item.isFile() && item.name.toLowerCase().endsWith(".pdf")) {
        // Generate a clean display name from filename
        const displayName = item.name
          .replace(/\.pdf$/i, "")
          .replace(/\.docx/i, "")
          .replace(/-/g, " ")
          .replace(/_/g, " ")
          .trim();

        // Determine the file path relative to pdf directory
        const relativePath = category ? `${category}/${item.name}` : item.name;

        results.push({
          name: displayName,
          file: relativePath,
          category: category || "Uncategorized",
        });
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message);
  }

  return results;
}

/**
 * Generate the data.js file content
 * @param {Array} pdfFiles - Array of PDF file objects
 * @returns {string} File content
 */
function generateDataFile(pdfFiles) {
  // Group PDFs by category
  const grouped = {};
  pdfFiles.forEach((pdf) => {
    if (!grouped[pdf.category]) {
      grouped[pdf.category] = [];
    }
    grouped[pdf.category].push({
      name: pdf.name,
      file: pdf.file,
    });
  });

  // Sort categories and PDFs within each category
  const sortedCategories = Object.keys(grouped).sort();

  let content = "export const pdfFiles = [\n";

  sortedCategories.forEach((category, catIndex) => {
    // Sort PDFs within category by name
    const sortedPdfs = grouped[category].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    content += "  {\n";
    content += `    category: "${category}",\n`;
    content += "    pdfs: [\n";

    sortedPdfs.forEach((pdf, pdfIndex) => {
      content += "      {\n";
      content += `        name: "${pdf.name}",\n`;
      content += `        file: "${pdf.file}",\n`;
      content += "      }";

      if (pdfIndex < sortedPdfs.length - 1) {
        content += ",";
      }
      content += "\n";
    });

    content += "    ],\n";
    content += "  }";

    if (catIndex < sortedCategories.length - 1) {
      content += ",";
    }
    content += "\n";
  });

  content += "];\n";

  return content;
}

/**
 * Main function
 */
function main() {
  console.log("🔍 Scanning PDF directory...");
  console.log(`   Path: ${PDF_DIR}\n`);

  // Check if PDF directory exists
  if (!fs.existsSync(PDF_DIR)) {
    console.error("❌ Error: PDF directory not found!");
    process.exit(1);
  }

  // Scan for PDF files
  const pdfFiles = scanDirectory(PDF_DIR);

  if (pdfFiles.length === 0) {
    console.warn("⚠️  Warning: No PDF files found!");
    return;
  }

  // Group by category for display
  const categories = {};
  pdfFiles.forEach((pdf) => {
    if (!categories[pdf.category]) {
      categories[pdf.category] = 0;
    }
    categories[pdf.category]++;
  });

  console.log(
    `📊 Found ${pdfFiles.length} PDF files in ${
      Object.keys(categories).length
    } categories:\n`
  );

  Object.keys(categories)
    .sort()
    .forEach((category) => {
      console.log(`   • ${category}: ${categories[category]} files`);
    });

  // Generate data.js content
  const dataContent = generateDataFile(pdfFiles);

  // Write to file
  try {
    fs.writeFileSync(DATA_FILE, dataContent, "utf8");
    console.log(`\n✅ Successfully updated ${DATA_FILE}`);
    console.log(`   Total entries: ${pdfFiles.length}`);
  } catch (error) {
    console.error("❌ Error writing data.js:", error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { scanDirectory, generateDataFile };
