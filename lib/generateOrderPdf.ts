import PDFDocument from "pdfkit";

export interface OrderPdfItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  specs?: string;
  category?: string;
}

export interface OrderPdfData {
  orderId: string;
  orderDate: string;
  customerName: string;
  companyName?: string;
  phone: string;
  address?: string;
  city: string;
  notes?: string;
  items: OrderPdfItem[];
  subtotal: number;
}

export function generateOrderPdf(data: OrderPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 45,
      info: {
        Title: `Order_${data.orderId}`,
        Author: "Anabia",
        Subject: "Wholesale Order Invoice",
      },
    });

    const buffers: Buffer[] = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", (err) => reject(err));

    const primaryColor = "#1A1A1A";
    const mutedColor = "#777777";
    const lightLine = "#E5E4E0";
    const bgLight = "#F9F8F6";

    // ----------------------------------------------------
    // 1. HEADER SECTION
    // ----------------------------------------------------
    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .fillColor(primaryColor)
      .text("A N A B I A", 45, 45, { characterSpacing: 2 });

    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor(mutedColor)
      .text("ARCHIVAL HOMEWARES & HANDCRAFTED OBJECTS", 45, 72, {
        characterSpacing: 1.5,
      });

    // Right-aligned order title & details
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor(primaryColor)
      .text("PURCHASE ORDER", 350, 45, { align: "right", width: 200 });

    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor(mutedColor)
      .text(`Order Ref: ${data.orderId}`, 350, 64, { align: "right", width: 200 })
      .text(`Date: ${data.orderDate}`, 350, 77, { align: "right", width: 200 })
      .text(`Status: Confirmed / New`, 350, 90, { align: "right", width: 200 });

    // Divider
    doc
      .moveTo(45, 110)
      .lineTo(550, 110)
      .strokeColor(lightLine)
      .lineWidth(1)
      .stroke();

    // ----------------------------------------------------
    // 2. BILL TO & FULFILLMENT COLUMNS
    // ----------------------------------------------------
    const metaTop = 125;

    // Left Box: Customer Details
    doc
      .fontSize(8.5)
      .font("Helvetica-Bold")
      .fillColor(mutedColor)
      .text("BILL TO / CLIENT DETAILS", 45, metaTop, { characterSpacing: 1 });

    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor(primaryColor)
      .text(data.customerName, 45, metaTop + 16);

    let customerY = metaTop + 30;
    doc.fontSize(9).font("Helvetica").fillColor(primaryColor);

    if (data.companyName) {
      doc.text(`Company: ${data.companyName}`, 45, customerY);
      customerY += 13;
    }
    doc.text(`Phone: ${data.phone}`, 45, customerY);
    customerY += 13;
    if (data.address) {
      doc.text(`Address: ${data.address}`, 45, customerY, { width: 255 });
      customerY += doc.heightOfString(`Address: ${data.address}`, { width: 255 }) + 3;
    }
    doc.text(`Destination: ${data.city}`, 45, customerY);
    customerY += 13;

    // Right Box: Store & Dispatch Info
    doc
      .fontSize(8.5)
      .font("Helvetica-Bold")
      .fillColor(mutedColor)
      .text("FULFILLMENT & CONTACT", 330, metaTop, { characterSpacing: 1 });

    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor(primaryColor)
      .text("Store: Anabia Traders", 330, metaTop + 16)
      .text("Packaging: Plastic-free archival kraft", 330, metaTop + 30)
      .text("Dispatch: Within 48 hours", 330, metaTop + 43)
      .text("Inquiries: ayanhusain2907@gmail.com", 330, metaTop + 56)
      .text("WhatsApp: +91 9702025325", 330, metaTop + 69);

    // Divider before table - dynamically placed below customer & store blocks
    const tableTop = Math.max(225, customerY + 12);
    doc
      .moveTo(45, tableTop)
      .lineTo(550, tableTop)
      .strokeColor(lightLine)
      .lineWidth(1)
      .stroke();

    // ----------------------------------------------------
    // 3. ITEMS TABLE HEADER
    // ----------------------------------------------------
    doc
      .rect(45, tableTop + 1, 505, 24)
      .fillColor(bgLight)
      .fill();

    doc
      .fontSize(8)
      .font("Helvetica-Bold")
      .fillColor(mutedColor);

    doc.text("ITEM DESCRIPTION", 55, tableTop + 8, { width: 250 });
    doc.text("QTY", 310, tableTop + 8, { width: 40, align: "center" });
    doc.text("UNIT PRICE (INR)", 360, tableTop + 8, { width: 85, align: "right" });
    doc.text("TOTAL (INR)", 455, tableTop + 8, { width: 85, align: "right" });

    doc
      .moveTo(45, tableTop + 25)
      .lineTo(550, tableTop + 25)
      .strokeColor(lightLine)
      .lineWidth(1)
      .stroke();

    // ----------------------------------------------------
    // 4. ITEMS TABLE ROWS
    // ----------------------------------------------------
    let currentY = tableTop + 32;

    data.items.forEach((item, index) => {
      const lineTotal = item.price * item.quantity;
      const formattedUnitPrice = `₹${item.price.toLocaleString("en-IN")}`;
      const formattedLineTotal = `₹${lineTotal.toLocaleString("en-IN")}`;

      // Item Name
      doc
        .fontSize(9.5)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text(`${index + 1}.  ${item.name}`, 55, currentY, { width: 245 });

      // Specs / Category subtext if present
      const subInfo = [item.category, item.specs].filter(Boolean).join(" • ");
      if (subInfo) {
        doc
          .fontSize(8)
          .font("Helvetica")
          .fillColor(mutedColor)
          .text(subInfo, 69, currentY + 13, { width: 230 });
      }

      // Quantity
      doc
        .fontSize(9.5)
        .font("Helvetica")
        .fillColor(primaryColor)
        .text(item.quantity.toString(), 310, currentY, {
          width: 40,
          align: "center",
        });

      // Unit Price
      doc
        .fontSize(9.5)
        .font("Helvetica")
        .fillColor(primaryColor)
        .text(formattedUnitPrice, 360, currentY, { width: 85, align: "right" });

      // Total
      doc
        .fontSize(9.5)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text(formattedLineTotal, 455, currentY, { width: 85, align: "right" });

      currentY += subInfo ? 30 : 22;

      // Subtle row divider
      doc
        .moveTo(45, currentY)
        .lineTo(550, currentY)
        .strokeColor("#F2F1EF")
        .lineWidth(0.5)
        .stroke();

      currentY += 8;
    });

    // ----------------------------------------------------
    // 5. TOTALS SECTION
    // ----------------------------------------------------
    currentY += 10;
    const formattedSubtotal = `₹${data.subtotal.toLocaleString("en-IN")}`;

    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor(mutedColor)
      .text("Subtotal:", 350, currentY, { width: 100, align: "right" });
    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .fillColor(primaryColor)
      .text(formattedSubtotal, 455, currentY, { width: 85, align: "right" });

    currentY += 16;
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor(mutedColor)
      .text("Shipping:", 350, currentY, { width: 100, align: "right" });
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor(mutedColor)
      .text("Calculated at dispatch", 455, currentY, {
        width: 85,
        align: "right",
      });

    currentY += 18;
    doc
      .moveTo(350, currentY)
      .lineTo(550, currentY)
      .strokeColor(primaryColor)
      .lineWidth(1)
      .stroke();

    currentY += 8;
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor(primaryColor)
      .text("TOTAL (INR):", 330, currentY, { width: 120, align: "right" });
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor(primaryColor)
      .text(formattedSubtotal, 455, currentY - 1, { width: 85, align: "right" });

    // ----------------------------------------------------
    // 6. SPECIAL NOTES (if any)
    // ----------------------------------------------------
    if (data.notes && data.notes.trim()) {
      currentY += 40;
      doc
        .rect(45, currentY, 505, 45)
        .fillColor(bgLight)
        .fill();

      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .fillColor(mutedColor)
        .text("CLIENT NOTES & INSTRUCTIONS:", 55, currentY + 8);

      doc
        .fontSize(8.5)
        .font("Helvetica")
        .fillColor(primaryColor)
        .text(data.notes, 55, currentY + 20, { width: 485 });

      currentY += 55;
    } else {
      currentY += 40;
    }

    // ----------------------------------------------------
    // 7. FOOTER NOTE
    // ----------------------------------------------------
    const footerY = 740;
    doc
      .moveTo(45, footerY)
      .lineTo(550, footerY)
      .strokeColor(lightLine)
      .lineWidth(1)
      .stroke();

    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor(mutedColor)
      .text(
        "Small-batch artisanal editions • Plastic-free recyclable packaging • Direct provenance from regional master artisans",
        45,
        footerY + 12,
        { align: "center", width: 505 }
      )
      .text("© Anabia • Inquiries & Support: ayanhusain2907@gmail.com", 45, footerY + 24, {
        align: "center",
        width: 505,
      });

    doc.end();
  });
}
