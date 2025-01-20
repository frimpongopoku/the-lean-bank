import jsPDF from "jspdf";
export const generatePDF = (
  cssSelector = ".printable-area",
  filename = "lean-bank-generated-pdf"
) => {
  const doc = new jsPDF();
  const content = document.querySelector(cssSelector);

  if (content) {
    doc.text("Transactions", 10, 10); // Add a title to the PDF
    doc.autoTable({
      html: content.querySelector("table"), // Use the table inside printable-area
    });
    doc.save(filename);
  } else {
    console.error("No content found to print");
  }
};
