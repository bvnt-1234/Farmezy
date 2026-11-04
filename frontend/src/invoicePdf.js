import { jsPDF } from "jspdf"

/**
 * Format currency in Indian format
 */
export function formatINR(val) {
  const num = Number(val) || 0
  return "₹" + num.toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 0 })
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
    }) + " " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
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
 * Generates and downloads a professional, vector-sharp PDF invoice for an order.
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

  // 1. Top Decorative Brand Banner (Dark Forest Green)
  doc.setFillColor(21, 128, 61) // #15803d
  doc.rect(0, 0, pageWidth, 28, "F")

  // Brand Logo Mark 'f' in circle
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(margin, 5, 18, 18, 9, 9, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.setTextColor(21, 128, 61)
  doc.text("f", margin + 6.5, 17.5)

  // Brand Title & Tagline
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(19)
  doc.text("farmezy.", margin + 22, 14)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.5)
  doc.setTextColor(220, 252, 231) // Light mint #dcfce7
  doc.text("Direct Farmgate Produce Marketplace | Fresh from India's Farmers", margin + 22, 20)

  // Header Right: Document Type
  doc.setFont("helvetica", "bold")
  doc.setFontSize(13)
  doc.setTextColor(255, 255, 255)
  doc.text("TAX INVOICE / CASH BILL", pageWidth - margin, 13, { align: "right" })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.5)
  doc.setTextColor(220, 252, 231)
  doc.text("Original for Recipient", pageWidth - margin, 19, { align: "right" })

  // 2. Invoice Meta Bar (Invoice #, Date, Order ID, Payment Status)
  const metaY = 34
  doc.setFillColor(243, 244, 246) // #f3f4f6
  doc.roundedRect(margin, metaY, contentWidth, 16, 2, 2, "F")
  doc.setDrawColor(229, 231, 235)
  doc.roundedRect(margin, metaY, contentWidth, 16, 2, 2, "S")

  const colW = contentWidth / 4

  // Invoice Number
  doc.setFontSize(7.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(107, 114, 128)
  doc.text("INVOICE NUMBER", margin + 4, metaY + 5.5)
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(17, 24, 39)
  doc.text(invoiceNumber, margin + 4, metaY + 11.5)

  // Invoice Date
  doc.setFontSize(7.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(107, 114, 128)
  doc.text("DATE & TIME", margin + colW + 4, metaY + 5.5)
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(31, 41, 55)
  doc.text(invoiceDate, margin + colW + 4, metaY + 11.5)

  // Order ID
  doc.setFontSize(7.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(107, 114, 128)
  doc.text("ORDER ID", margin + (colW * 2) + 4, metaY + 5.5)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(31, 41, 55)
  doc.text("#" + String(order.id || ""), margin + (colW * 2) + 4, metaY + 11.5)

  // Payment Status
  doc.setFontSize(7.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(107, 114, 128)
  doc.text("PAYMENT STATUS", margin + (colW * 3) + 4, metaY + 5.5)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  if (isPaid) {
    doc.setTextColor(21, 128, 61)
  } else {
    doc.setTextColor(180, 83, 9)
  }
  doc.text(paymentStatus, margin + (colW * 3) + 4, metaY + 11.5)

  // 3. Two-Column Parties Box: Customer Details (Left) & Farmer Details (Right)
  const partiesY = 54
  const boxWidth = (contentWidth - 6) / 2
  const boxHeight = 40

  // Left Box: Billed To (Customer)
  doc.setFillColor(250, 250, 250)
  doc.roundedRect(margin, partiesY, boxWidth, boxHeight, 2, 2, "F")
  doc.setDrawColor(229, 231, 235)
  doc.roundedRect(margin, partiesY, boxWidth, boxHeight, 2, 2, "S")

  // Top sub-header line
  doc.setFillColor(243, 244, 246)
  doc.roundedRect(margin, partiesY, boxWidth, 7, 2, 2, "F")
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(55, 65, 81)
  doc.text("BILLED TO (CUSTOMER)", margin + 4, partiesY + 4.8)

  doc.setFontSize(9.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(17, 24, 39)
  doc.text(String(order.customerName || "Customer"), margin + 4, partiesY + 13)

  doc.setFontSize(8.5)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(75, 85, 99)
  doc.text("Phone: " + String(order.customerPhone || "Not provided"), margin + 4, partiesY + 19)

  const custAddr = String(order.customerLocation || "Direct Farmgate Pickup / Local")
  const splitCustAddr = doc.splitTextToSize("Delivery: " + custAddr, boxWidth - 8)
  doc.text(splitCustAddr, margin + 4, partiesY + 25)

  // Right Box: Sold By (Farmer / Producer)
  const rightX = margin + boxWidth + 6
  doc.setFillColor(250, 250, 250)
  doc.roundedRect(rightX, partiesY, boxWidth, boxHeight, 2, 2, "F")
  doc.setDrawColor(229, 231, 235)
  doc.roundedRect(rightX, partiesY, boxWidth, boxHeight, 2, 2, "S")

  doc.setFillColor(243, 244, 246)
  doc.roundedRect(rightX, partiesY, boxWidth, 7, 2, 2, "F")
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(55, 65, 81)
  doc.text("SOLD BY (FARMER / PRODUCER)", rightX + 4, partiesY + 4.8)

  doc.setFontSize(9.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(17, 24, 39)
  doc.text(String(order.farmerName || "Farmer"), rightX + 4, partiesY + 13)

  doc.setFontSize(8.5)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(75, 85, 99)
  doc.text("Phone: " + String(order.farmerPhone || "Direct Farm Contact"), rightX + 4, partiesY + 19)

  const farmerLoc = String(order.farmerAddress || order.address || "Verified Farmezy Registered Farm")
  const splitFarmerLoc = doc.splitTextToSize("Farm Location: " + farmerLoc, boxWidth - 8)
  doc.text(splitFarmerLoc, rightX + 4, partiesY + 25)

  // 4. Order Items Table
  const tableY = 100
  const tableHeaderHeight = 8

  // Table Header
  doc.setFillColor(21, 128, 61)
  doc.roundedRect(margin, tableY, contentWidth, tableHeaderHeight, 1.5, 1.5, "F")

  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(255, 255, 255)

  const c1 = margin + 4 // #
  const c2 = margin + 18 // Description
  const c3 = margin + 95 // Quantity
  const c4 = margin + 130 // Unit Rate
  const c5 = margin + contentWidth - 4 // Total Amount

  doc.text("#", c1, tableY + 5.5)
  doc.text("PRODUCT / CROP DESCRIPTION", c2, tableY + 5.5)
  doc.text("QUANTITY", c3, tableY + 5.5)
  doc.text("RATE (INR)", c4, tableY + 5.5)
  doc.text("AMOUNT (INR)", c5, tableY + 5.5, { align: "right" })

  // Table Row 1
  const rowY = tableY + tableHeaderHeight + 2
  const rowHeight = 16

  doc.setFillColor(255, 255, 255)
  doc.rect(margin, rowY, contentWidth, rowHeight, "F")
  doc.setDrawColor(229, 231, 235)
  doc.line(margin, rowY + rowHeight, margin + contentWidth, rowY + rowHeight)

  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(31, 41, 55)
  doc.text("1", c1, rowY + 6.5)

  // Crop Title & Subtext
  const cropTitle = String(order.crop || "Fresh Produce").toUpperCase()
  doc.text(cropTitle, c2, rowY + 6.5)

  doc.setFontSize(7.5)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(107, 114, 128)
  doc.text("Fresh Farmgate Harvest · Grade A Quality", c2, rowY + 11.5)

  // Qty
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(31, 41, 55)
  doc.text(`${order.quantity} ${order.unit || "kg"}`, c3, rowY + 6.5)

  // Unit Price
  doc.setFont("helvetica", "normal")
  doc.text(`₹${Number(order.price || 0).toLocaleString("en-IN")}/${order.unit || "kg"}`, c4, rowY + 6.5)

  // Amount
  doc.setFont("helvetica", "bold")
  doc.setTextColor(21, 128, 61)
  doc.text(`₹${subtotal.toLocaleString("en-IN")}`, c5, rowY + 6.5, { align: "right" })

  // 5. Summary Section (Subtotal, Delivery, Grand Total & Payment Method)
  const summaryY = rowY + rowHeight + 8
  const summaryBoxWidth = 85
  const summaryX = margin + contentWidth - summaryBoxWidth

  // Left Note Box: Payment Method & Buyer Protections
  const leftNoteW = contentWidth - summaryBoxWidth - 6
  doc.setFillColor(249, 250, 251)
  doc.roundedRect(margin, summaryY, leftNoteW, 46, 2, 2, "F")
  doc.setDrawColor(229, 231, 235)
  doc.roundedRect(margin, summaryY, leftNoteW, 46, 2, 2, "S")

  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(31, 41, 55)
  doc.text("PAYMENT & DELIVERY TERMS", margin + 4, summaryY + 6)

  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(75, 85, 99)
  doc.text("• Payment Mode: Direct Farmgate Pay on Delivery / UPI", margin + 4, summaryY + 13)
  doc.text("• Delivery Type: Direct pickup or farmer coordinated transport", margin + 4, summaryY + 19)
  doc.text("• Zero middleman commission charged to farmer or buyer", margin + 4, summaryY + 25)
  doc.text("• Verified agricultural trade on the FarmEzy network", margin + 4, summaryY + 31)
  doc.text("• Support: support@farmezy.in | +91 98765 43210", margin + 4, summaryY + 37)

  // Right Box: Totals & Grand Total
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(summaryX, summaryY, summaryBoxWidth, 46, 2, 2, "F")
  doc.setDrawColor(229, 231, 235)
  doc.roundedRect(summaryX, summaryY, summaryBoxWidth, 46, 2, 2, "S")

  // Subtotal
  doc.setFontSize(8.5)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(107, 114, 128)
  doc.text("Subtotal:", summaryX + 4, summaryY + 7.5)
  doc.setTextColor(31, 41, 55)
  doc.text(`₹${subtotal.toLocaleString("en-IN")}`, summaryX + summaryBoxWidth - 4, summaryY + 7.5, { align: "right" })

  // Delivery Charges
  doc.setTextColor(107, 114, 128)
  doc.text("Delivery & Handling:", summaryX + 4, summaryY + 14.5)
  doc.setTextColor(21, 128, 61)
  doc.text("₹0.00 (Free / Pickup)", summaryX + summaryBoxWidth - 4, summaryY + 14.5, { align: "right" })

  // Taxes / Fees
  doc.setTextColor(107, 114, 128)
  doc.text("Mandi Cess / Platform Fee:", summaryX + 4, summaryY + 21.5)
  doc.setTextColor(31, 41, 55)
  doc.text("₹0.00", summaryX + summaryBoxWidth - 4, summaryY + 21.5, { align: "right" })

  // Divider Line
  doc.setDrawColor(209, 213, 219)
  doc.line(summaryX + 4, summaryY + 26, summaryX + summaryBoxWidth - 4, summaryY + 26)

  // Grand Total Highlight
  doc.setFillColor(240, 253, 244) // #f0fdf4
  doc.rect(summaryX + 1, summaryY + 28, summaryBoxWidth - 2, 16, "F")

  doc.setFontSize(10.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(21, 128, 61)
  doc.text("GRAND TOTAL:", summaryX + 4, summaryY + 38)
  doc.setFontSize(12.5)
  doc.text(`₹${grandTotal.toLocaleString("en-IN")}`, summaryX + summaryBoxWidth - 4, summaryY + 38, { align: "right" })

  // 6. Thank You & Stamp Banner
  const thankYouY = summaryY + 54
  doc.setFillColor(240, 253, 244)
  doc.roundedRect(margin, thankYouY, contentWidth, 22, 2, 2, "F")
  doc.setDrawColor(187, 247, 208)
  doc.roundedRect(margin, thankYouY, contentWidth, 22, 2, 2, "S")

  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(21, 128, 61)
  doc.text("Thank you for supporting Indian farmers with FarmEzy!", margin + contentWidth / 2, thankYouY + 8.5, { align: "center" })

  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(75, 85, 99)
  doc.text("Your direct order empowers local agriculture and eliminates commission middlemen.", margin + contentWidth / 2, thankYouY + 15, { align: "center" })

  // 7. Footer
  const footerY = pageHeight - 12
  doc.setDrawColor(229, 231, 235)
  doc.line(margin, footerY - 4, margin + contentWidth, footerY - 4)

  doc.setFontSize(7.5)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(156, 163, 175)
  doc.text("This is an electronically generated invoice valid without signature. FarmEzy Agri Marketplace.", margin, footerY)
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
        <td><b>${String(order.crop || "Produce").toUpperCase()}</b><br><small style="color:#6b7280;">Fresh Farmgate Harvest · Grade A</small></td>
        <td><b>${order.quantity} ${order.unit || "kg"}</b></td>
        <td class="right">₹${Number(order.price || 0).toLocaleString("en-IN")}/${order.unit || "kg"}</td>
        <td class="right"><b>₹${subtotal.toLocaleString("en-IN")}</b></td>
      </tr>
    </tbody>
  </table>

  <div class="totals-area">
    <div class="totals-box">
      <div class="total-row"><span>Subtotal:</span><span>₹${subtotal.toLocaleString("en-IN")}</span></div>
      <div class="total-row"><span>Delivery Charges:</span><span style="color:#15803d;">₹0.00 (Free/Pickup)</span></div>
      <div class="total-row"><span>Taxes / Platform Fee:</span><span>₹0.00</span></div>
      <div class="total-row grand"><span>Grand Total:</span><span>₹${subtotal.toLocaleString("en-IN")}</span></div>
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
