import { format } from "date-fns";
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

export const makeDate = () => {
  return new Date();
};


/**
 * Detects the date type and formats it to "day/month/year h:m:s"
 * @param {Date | { seconds: number, nanoseconds: number } | string} dateInput - The date input (JS Date, Firestore Timestamp, or string).
 * @returns {string} Formatted date in "dd/MM/yyyy HH:mm:ss" format.
 */
export const formatDateTime = (dateInput) => {
  let date;

  if (dateInput instanceof Date) {
    // Handle JS Date object
    date = dateInput;
  } else if (typeof dateInput === "object" && dateInput.seconds) {
    // Handle Firestore Timestamp { seconds, nanoseconds }
    date = new Date(dateInput.seconds * 1000);
  } else if (typeof dateInput === "string") {
    // Handle string date (if stored as string in Firestore)
    date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date string format");
    }
  } else {
    throw new Error("Unsupported date format");
  }

  return format(date, "dd/MM/yyyy HH:mm:ss");
};
