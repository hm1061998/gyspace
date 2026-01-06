import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface ExportPDFData {
  title: string;
  columns: string[];
  rows: any[][];
  filename: string;
}

// Function to convert ArrayBuffer to Base64
function base64ArrayBuffer(arrayBuffer: ArrayBuffer) {
  let base64 = "";
  const encodings =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const bytes = new Uint8Array(arrayBuffer);
  const byteLength = bytes.byteLength;
  const byteRemainder = byteLength % 3;
  const mainLength = byteLength - byteRemainder;

  let a, b, c, d;
  let chunk;

  for (let i = 0; i < mainLength; i = i + 3) {
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    a = (chunk & 16515072) >> 18;
    b = (chunk & 258048) >> 12;
    c = (chunk & 4032) >> 6;
    d = chunk & 63;
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
  }

  if (byteRemainder === 1) {
    chunk = bytes[mainLength];
    a = (chunk & 252) >> 2;
    b = (chunk & 3) << 4;
    base64 += encodings[a] + encodings[b] + "==";
  } else if (byteRemainder === 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
    a = (chunk & 64512) >> 10;
    b = (chunk & 1008) >> 4;
    c = (chunk & 15) << 2;
    base64 += encodings[a] + encodings[b] + encodings[c] + "=";
  }

  return base64;
}

/**
 * Modern Export PDF Service with Unicode (Vietnamese/Chinese) support
 */
export const exportPDF = async (
  data: ExportPDFData,
  onProgress?: (progress: number, status: string) => void
) => {
  const { title, columns, rows, filename } = data;

  if (!columns || !rows) {
    throw new Error("Dữ liệu xuất không hợp lệ (thiếu cột hoặc hàng).");
  }

  try {
    onProgress?.(40, "Đang tải bộ phông chữ Unicode...");

    const fontUrl = "/assets/fonts/NotoSerifSC-400.ttf";
    const response = await fetch(fontUrl);
    if (!response.ok)
      throw new Error("Không thể tải phông chữ từ hệ thống (Local Assets)");

    const fontBuffer = await response.arrayBuffer();
    const fontBase64 = base64ArrayBuffer(fontBuffer);

    onProgress?.(70, "Đang thiết lập cấu trúc PDF...");

    const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      putOnlyUsedFonts: true,
    });

    // Register the custom font
    const fontName = "NotoSerifSC";
    doc.addFileToVFS(`${fontName}.ttf`, fontBase64);
    doc.addFont(`${fontName}.ttf`, fontName, "normal");
    doc.setFont(fontName);

    onProgress?.(85, "Đang tạo bảng dữ liệu...");

    // Using a more robust configuration for autoTable
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 25,
      theme: "striped",
      styles: {
        font: fontName,
        fontSize: 9,
        cellPadding: 2,
        overflow: "linebreak",
        halign: "left",
        valign: "middle",
      },
      headStyles: {
        fillColor: [220, 38, 38], // Red-600
        textColor: 255,
        fontStyle: "bold",
        fontSize: 10,
      },
      margin: { top: 25, right: 15, bottom: 20, left: 15 },
      didDrawPage: (drawData) => {
        // Safe access to internal properties
        const pageSize = doc.internal.pageSize;
        const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
        const pageHeight = pageSize.height
          ? pageSize.height
          : pageSize.getHeight();

        doc.setFont(fontName);
        doc.setFontSize(16);
        doc.setTextColor(40);
        doc.text(title.toUpperCase(), 15, 15);

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        const pageNumber = doc.internal.pages.length - 1;
        const footerText = `Trang ${pageNumber}`;
        doc.text(footerText, 15, pageHeight - 10);
      },
    });

    onProgress?.(95, "Đang hoàn thiện và tải xuống...");
    doc.save(`${filename}.pdf`);
    onProgress?.(100, "Hoàn tất!");

    return true;
  } catch (error) {
    console.error("PDF Export Error:", error);
    throw error;
  }
};
