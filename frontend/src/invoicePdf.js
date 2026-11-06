import { jsPDF } from "jspdf"

/**
 * Format currency in standard Indian format with Rs. prefix for clean, universal PDF rendering
 */
export function formatINR(val) {
  const num = Number(val) || 0
  return "Rs. " + num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * Format date for invoice display
 */
export function formatInvoiceDate(dateStr) {
  try {
    const d = dateStr ? new Date(dateStr) : new Date()
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }) + ", " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
  } catch {
    return String(dateStr || "")
  }
}

/**
 * Generate unique Invoice Number from Order ID
 */
export function getInvoiceNumber(order) {
  if (order.invoiceNumber) return order.invoiceNumber
  const idStr = String(order.id || Date.now())
  return "INV-" + idStr.slice(-6).toUpperCase()
}

/**
 * Generates and downloads a clean, professional, properly formatted PDF invoice for an order.
 * Uses exact vector alignments and standard Latin-1/WinAnsi characters to prevent broken glyphs or wide character gaps.
 */
export function generateInvoicePDF(order) {
  if (!order) return

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  })

  const invoiceNumber = getInvoiceNumber(order)
  const qty = Number(order.quantity) || 1
  const price = Number(order.price) || 0
  const unit = order.unit || "kg"
  const subtotal = qty * price
  const deliveryCharge = 0
  const discount = 0
  const grandTotal = subtotal + deliveryCharge - discount
  const isPaid = order.status === "Completed"
  const paymentStatus = isPaid ? "Paid (Completed)" : "Pending on Delivery"
  const invoiceDate = formatInvoiceDate(order.createdAt || new Date().toISOString())

  const pageWidth = 210
  const pageHeight = 297
  const margin = 14
  const contentWidth = pageWidth - (margin * 2)

  // 1. Top Brand Banner (Dark Forest Green #15803d)
  doc.setFillColor(21, 128, 61)
  doc.rect(0, 0, pageWidth, 28, "F")

  // Logo Circle with crisp centered "f"
  doc.setFillColor(255, 255, 255)
  doc.circle(margin + 8, 14, 8, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(15)
  doc.setTextColor(21, 128, 61)
  doc.text("f", margin + 8, 18.5, { align: "center" })

  // Brand Name & Tagline
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.text("farmezy.", margin + 20, 13.5)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(220, 252, 231) // Mint #dcfce7
  doc.text("Direct Farmgate Produce Marketplace | Fresh from India's Farmers", margin + 20, 19.5)

  // Header Right: Document Type
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12.5)
  doc.setTextColor(255, 255, 255)
  doc.text("TAX INVOICE / CASH BILL", pageWidth - margin, 13, { align: "right" })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(220, 252, 231)
  doc.text("Original for Recipient", pageWidth - margin, 19, { align: "right" })

  // 2. Invoice Meta Bar (Invoice #, Date, Order ID, Payment Status)
  const metaY = 33
  const metaHeight = 16
  doc.setFillColor(248, 250, 252) // #f8fafc
  doc.roundedRect(margin, metaY, contentWidth, metaHeight, 2, 2, "F")
  doc.setDrawColor(226, 232, 240) // #e2e8f0
  doc.roundedRect(margin, metaY, contentWidth, metaHeight, 2, 2, "S")

  const colW = contentWidth / 4

  // Invoice Number
  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(100, 116, 139)
  doc.text("INVOICE NUMBER", margin + 5, metaY + 5.5)
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(15, 23, 42)
  doc.text(invoiceNumber, margin + 5, metaY + 11.5)

  // Invoice Date
  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(100, 116, 139)
  doc.text("DATE & TIME", margin + colW + 4, metaY + 5.5)
  doc.setFontSize(8.5)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(30, 41, 59)
  doc.text(invoiceDate, margin + colW + 4, metaY + 11.5)

  // Order ID
  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(100, 116, 139)
  doc.text("ORDER ID", margin + (colW * 2) + 4, metaY + 5.5)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(30, 41, 59)
  doc.text("#" + String(order.id || ""), margin + (colW * 2) + 4, metaY + 11.5)

  // Payment Status
  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(100, 116, 139)
  doc.text("PAYMENT STATUS", margin + (colW * 3) + 4, metaY + 5.5)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  if (isPaid) {
    doc.setTextColor(21, 128, 61)
  } else {
    doc.setTextColor(180, 83, 9)
  }
  doc.text(paymentStatus, margin + (colW * 3) + 4, metaY + 11.5)

  // 3. Parties Section: Billed To (Customer) & Sold By (Farmer)
  const partiesY = 53
  const boxWidth = (contentWidth - 6) / 2
  const boxHeight = 35

  // Left Box: Billed To (Customer)
  doc.setFillColor(250, 250, 250)
  doc.roundedRect(margin, partiesY, boxWidth, boxHeight, 2, 2, "F")
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(margin, partiesY, boxWidth, boxHeight, 2, 2, "S")

  doc.setFillColor(241, 245, 249)
  doc.roundedRect(margin, partiesY, boxWidth, 7, 2, 2, "F")
  doc.setFontSize(7.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(71, 85, 105)
  doc.text("BILLED TO (CUSTOMER)", margin + 4, partiesY + 4.8)

  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(15, 23, 42)
  doc.text(String(order.customerName || "Customer"), margin + 4, partiesY + 13.5)

  doc.setFontSize(8.5)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(71, 85, 105)
  doc.text("Phone: " + String(order.customerPhone || "Not provided"), margin + 4, partiesY + 19.5)

  const custAddr = String(order.customerLocation || "Direct Farmgate Pickup / Local")
  const splitCust = doc.splitTextToSize("Delivery: " + custAddr, boxWidth - 8)
  doc.text(splitCust, margin + 4, partiesY + 25)

  // Right Box: Sold By (Farmer / Producer)
  const rightX = margin + boxWidth + 6
  doc.setFillColor(250, 250, 250)
  doc.roundedRect(rightX, partiesY, boxWidth, boxHeight, 2, 2, "F")
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(rightX, partiesY, boxWidth, boxHeight, 2, 2, "S")

  doc.setFillColor(241, 245, 249)
  doc.roundedRect(rightX, partiesY, boxWidth, 7, 2, 2, "F")
  doc.setFontSize(7.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(71, 85, 105)
  doc.text("SOLD BY (FARMER / PRODUCER)", rightX + 4, partiesY + 4.8)

  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(15, 23, 42)
  doc.text(String(order.farmerName || "Farmer"), rightX + 4, partiesY + 13.5)

  doc.setFontSize(8.5)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(71, 85, 105)
  doc.text("Phone: " + String(order.farmerPhone || "Direct Farm Contact"), rightX + 4, partiesY + 19.5)

  const farmerLoc = String(order.farmerAddress || order.address || "Verified Farmezy Registered Farm")
  const splitFarmer = doc.splitTextToSize("Farm: " + farmerLoc, boxWidth - 8)
  doc.text(splitFarmer, rightX + 4, partiesY + 25)

  // 4. Order Items Table
  const tableY = 93
  const headerH = 8

  // Header fill
  doc.setFillColor(21, 128, 61)
  doc.roundedRect(margin, tableY, contentWidth, headerH, 1.5, 1.5, "F")

  // Column X positions with matched text alignments
  const c1 = margin + 4 // # (left)
  const c2 = margin + 14 // Description (left)
  const c3 = margin + 98 // Quantity (right)
  const c4 = margin + 138 // Unit Rate (right)
  const c5 = margin + contentWidth - 4 // Amount (right)

  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(255, 255, 255)
  doc.text("#", c1, tableY + 5.5)
  doc.text("PRODUCT / CROP DESCRIPTION", c2, tableY + 5.5)
  doc.text("QUANTITY", c3, tableY + 5.5, { align: "right" })
  doc.text("RATE (PER UNIT)", c4, tableY + 5.5, { align: "right" })
  doc.text("TOTAL (INR)", c5, tableY + 5.5, { align: "right" })

  // Row 1
  const rowY = tableY + headerH
  const rowH = 15

  doc.setFillColor(255, 255, 255)
  doc.rect(margin, rowY, contentWidth, rowH, "F")
  doc.setDrawColor(226, 232, 240)
  doc.line(margin, rowY + rowH, margin + contentWidth, rowY + rowH)

  // #
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(71, 85, 105)
  doc.text("1", c1, rowY + 6.5)

  // Description
  const cropTitle = String(order.crop || "Fresh Produce").toUpperCase()
  doc.setFont("helvetica", "bold")
  doc.setTextColor(15, 23, 42)
  doc.text(cropTitle, c2, rowY + 6.5)

  doc.setFontSize(7.5)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100, 116, 139)
  doc.text("Fresh Farmgate Harvest | Grade A Quality", c2, rowY + 11.5)

  // Quantity (aligned right with column header)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(30, 41, 59)
  doc.text(`${qty} ${unit}`, c3, rowY + 6.5, { align: "right" })

  // Rate (aligned right with column header)
  doc.setFontSize(8.5)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(51, 65, 85)
  doc.text(`Rs. ${price.toLocaleString("en-IN", { minimumFractionDigits: 2 })} / ${unit}`, c4, rowY + 6.5, { align: "right" })

  // Total (aligned right with column header)
  doc.setFontSize(9.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(21, 128, 61)
  doc.text(formatINR(subtotal), c5, rowY + 6.5, { align: "right" })

  // 5. Terms & Summary Box
  const summaryY = rowY + rowH + 6
  const summaryBoxW = 82
  const summaryX = margin + contentWidth - summaryBoxW
  const leftNoteW = contentWidth - summaryBoxW - 6
  const boxH = 46

  // Left Note Box: Terms
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(margin, summaryY, leftNoteW, boxH, 2, 2, "F")
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(margin, summaryY, leftNoteW, boxH, 2, 2, "S")

  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(30, 41, 59)
  doc.text("PAYMENT & DELIVERY TERMS", margin + 5, summaryY + 6.5)

  doc.setFontSize(7.5)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(71, 85, 105)
  doc.text("- Payment Mode: Direct Farmgate Pay on Delivery / UPI", margin + 5, summaryY + 13.5)
  doc.text("- Delivery Type: Direct farm pickup or farmer-arranged transit", margin + 5, summaryY + 19.5)
  doc.text("- Zero middleman commission charged to farmer or buyer", margin + 5, summaryY + 25.5)
  doc.text("- Verified agricultural trade on the FarmEzy network", margin + 5, summaryY + 31.5)
  doc.text("- Support & Help: support@farmezy.in | +91 98765 43210", margin + 5, summaryY + 37.5)

  // Right Box: Totals & Grand Total
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(summaryX, summaryY, summaryBoxW, boxH, 2, 2, "F")
  doc.setDrawColor(203, 213, 225)
  doc.roundedRect(summaryX, summaryY, summaryBoxW, boxH, 2, 2, "S")

  const labelX = summaryX + 5
  const valX = summaryX + summaryBoxW - 5

  // Subtotal
  doc.setFontSize(8.5)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100, 116, 139)
  doc.text("Subtotal:", labelX, summaryY + 8)
  doc.setTextColor(15, 23, 42)
  doc.text(formatINR(subtotal), valX, summaryY + 8, { align: "right" })

  // Delivery Charges
  doc.setTextColor(100, 116, 139)
  doc.text("Delivery & Handling:", labelX, summaryY + 15)
  doc.setTextColor(21, 128, 61)
  doc.setFont("helvetica", "bold")
  doc.text("FREE (Pickup)", valX, summaryY + 15, { align: "right" })

  // Mandi / Platform Cess
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100, 116, 139)
  doc.text("Mandi Cess / Platform Fee:", labelX, summaryY + 22)
  doc.setTextColor(71, 85, 105)
  doc.text("Rs. 0.00 (Waived)", valX, summaryY + 22, { align: "right" })

  // Divider Line
  doc.setDrawColor(226, 232, 240)
  doc.line(summaryX + 3, summaryY + 27, summaryX + summaryBoxW - 3, summaryY + 27)

  // Grand Total Highlight
  doc.setFillColor(240, 253, 244) // #f0fdf4
  doc.rect(summaryX + 1, summaryY + 29, summaryBoxW - 2, 15, "F")

  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(21, 128, 61)
  doc.text("GRAND TOTAL:", labelX, summaryY + 39)
  doc.setFontSize(12)
  doc.text(formatINR(grandTotal), valX, summaryY + 39, { align: "right" })

  // 6. Thank You Banner
  const thankYouY = summaryY + boxH + 8
  doc.setFillColor(240, 253, 244)
  doc.roundedRect(margin, thankYouY, contentWidth, 20, 2, 2, "F")
  doc.setDrawColor(187, 247, 208)
  doc.roundedRect(margin, thankYouY, contentWidth, 20, 2, 2, "S")

  doc.setFontSize(10.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(21, 128, 61)
  doc.text("Thank you for supporting Indian farmers with FarmEzy!", margin + (contentWidth / 2), thankYouY + 8, { align: "center" })

  doc.setFontSize(7.5)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(71, 85, 105)
  doc.text("Your direct order empowers local agriculture and eliminates middleman commissions.", margin + (contentWidth / 2), thankYouY + 14.5, { align: "center" })

  // 7. Footer
  const footerY = pageHeight - 12
  doc.setDrawColor(226, 232, 240)
  doc.line(margin, footerY - 4, margin + contentWidth, footerY - 4)

  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(148, 163, 184)
  doc.text("This is an electronically generated tax invoice valid without physical signature · FarmEzy Agri Marketplace.", margin, footerY)
  doc.text(`Generated on ${new Date().toLocaleDateString("en-IN")} · Page 1 of 1`, margin + contentWidth, footerY, { align: "right" })

  // Trigger real download to customer's device
  const fileName = `FarmEzy_Invoice_${invoiceNumber}.pdf`
  doc.save(fileName)
  return fileName
}

/**
 * Opens a dedicated printable HTML window with clean invoice styling and triggers window.print()
 */
export function printInvoice(order) {
  if (!order) return
  const invoiceNumber = getInvoiceNumber(order)
  const qty = Number(order.quantity) || 1
  const price = Number(order.price) || 0
  const unit = order.unit || "kg"
  const subtotal = qty * price
  const isPaid = order.status === "Completed"
  const paymentStatus = isPaid ? "Paid (Completed)" : "Pending on Delivery"
  const invoiceDate = formatInvoiceDate(order.createdAt || new Date().toISOString())

  const printWindow = window.open("", "_blank", "width=850,height=900")
  if (!printWindow) {
    alert("Please allow popups to print your invoice.")
    return
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>FarmEzy Invoice - ${invoiceNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 24px; color: #111827; background: #fff; }
    .header { background: #15803d; color: #fff; padding: 18px 24px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-mark { width: 36px; height: 36px; background: #fff; color: #15803d; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; }
    .brand-title { font-size: 22px; font-weight: bold; }
    .doc-type { text-align: right; }
    .doc-type h2 { margin: 0; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
    .doc-type p { margin: 4px 0 0; font-size: 12px; opacity: 0.9; }
    .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 18px; margin: 20px 0; }
    .meta-item small { font-size: 10px; color: #6b7280; font-weight: bold; text-transform: uppercase; display: block; }
    .meta-item b { font-size: 13px; color: #111827; }
    .parties-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .party-box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; background: #fafafa; }
    .party-title { font-size: 11px; font-weight: bold; color: #4b5563; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
    .party-name { font-size: 14px; font-weight: bold; margin-bottom: 4px; }
    .party-detail { font-size: 12px; color: #4b5563; margin: 2px 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #15803d; color: #fff; padding: 10px 14px; font-size: 12px; text-align: left; }
    th.right, td.right { text-align: right; }
    td { padding: 12px 14px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
    .totals-area { display: flex; justify-content: flex-end; margin-bottom: 24px; }
    .totals-box { width: 320px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; }
    .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; color: #4b5563; }
    .total-row.grand { border-top: 1px solid #d1d5db; margin-top: 8px; padding-top: 8px; font-size: 16px; font-weight: bold; color: #15803d; }
    .thank-you { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; text-align: center; }
    .thank-you h3 { margin: 0 0 6px; color: #15803d; font-size: 15px; }
    .thank-you p { margin: 0; font-size: 12px; color: #4b5563; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <div class="brand-mark">f</div>
      <div>
        <div class="brand-title">farmezy.</div>
        <small style="opacity:0.9; font-size:11px;">Direct Farmgate Produce Marketplace</small>
      </div>
    </div>
    <div class="doc-type">
      <h2>Tax Invoice / Bill</h2>
      <p>Original for Recipient</p>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <small>Invoice No</small>
      <b>${invoiceNumber}</b>
    </div>
    <div class="meta-item">
      <small>Invoice Date</small>
      <b>${invoiceDate}</b>
    </div>
    <div class="meta-item">
      <small>Order ID</small>
      <b>#${order.id}</b>
    </div>
    <div class="meta-item">
      <small>Status</small>
      <b style="color:${isPaid ? "#15803d" : "#b45309"};">${paymentStatus}</b>
    </div>
  </div>

  <div class="parties-grid">
    <div class="party-box">
      <div class="party-title">Billed To (Customer)</div>
      <div class="party-name">${order.customerName || "Customer"}</div>
      <div class="party-detail">Phone: ${order.customerPhone || "Not provided"}</div>
      <div class="party-detail">Location: ${order.customerLocation || "Direct Farmgate Pickup"}</div>
    </div>
    <div class="party-box">
      <div class="party-title">Sold By (Farmer)</div>
      <div class="party-name">${order.farmerName || "Farmer"}</div>
      <div class="party-detail">Phone: ${order.farmerPhone || "Direct Farm Contact"}</div>
      <div class="party-detail">Farm: ${order.farmerAddress || order.address || "Verified Farmezy Farmer"}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Product Description</th>
        <th>Quantity</th>
        <th class="right">Unit Rate</th>
        <th class="right">Total (INR)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td><b>${String(order.crop || "Produce").toUpperCase()}</b><br><small style="color:#6b7280;">Fresh Farmgate Harvest · Grade A Quality</small></td>
        <td><b>${qty} ${unit}</b></td>
        <td class="right">Rs. ${price.toLocaleString("en-IN", { minimumFractionDigits: 2 })} / ${unit}</td>
        <td class="right"><b>${formatINR(subtotal)}</b></td>
      </tr>
    </tbody>
  </table>

  <div class="totals-area">
    <div class="totals-box">
      <div class="total-row"><span>Subtotal:</span><span>${formatINR(subtotal)}</span></div>
      <div class="total-row"><span>Delivery Charges:</span><span style="color:#15803d; font-weight:bold;">FREE (Pickup)</span></div>
      <div class="total-row"><span>Taxes / Platform Fee:</span><span>Rs. 0.00 (Waived)</span></div>
      <div class="total-row grand"><span>Grand Total:</span><span>${formatINR(grandTotal)}</span></div>
    </div>
  </div>

  <div class="thank-you">
    <h3>Thank you for supporting Indian farmers with FarmEzy!</h3>
    <p>Your direct order ensures fair farmgate pricing and fresh produce. For support, contact help@farmezy.in</p>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}
