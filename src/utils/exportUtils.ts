import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { HOSPITAL } from '../data/mockData';

// =====================================================
// PDF UTILITIES
// =====================================================

const addHospitalHeader = (doc: jsPDF) => {
  const pageW = doc.internal.pageSize.getWidth();
  
  // Background header bar
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 35, 'F');
  
  // Hospital name
  doc.setTextColor(59, 130, 246);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(HOSPITAL.name, 15, 14);
  
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(HOSPITAL.tagline, 15, 20);
  doc.text(HOSPITAL.address, 15, 26);
  doc.text(`${HOSPITAL.phone} | ${HOSPITAL.email}`, 15, 31);
  
  // Right side info
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text(`Reg No: ${HOSPITAL.regNo}`, pageW - 15, 20, { align: 'right' });
  doc.text(`GSTIN: ${HOSPITAL.gstin}`, pageW - 15, 26, { align: 'right' });
  doc.text(`Website: ${HOSPITAL.website}`, pageW - 15, 31, { align: 'right' });
};

const addFooter = (doc: jsPDF) => {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const pageCount = (doc as any).internal.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(30, 41, 59);
    doc.line(15, pageH - 15, pageW - 15, pageH - 15);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${HOSPITAL.shortName} | Confidential Document`, 15, pageH - 8);
    doc.text(`Page ${i} of ${pageCount} | Generated: ${new Date().toLocaleString('en-IN')}`, pageW - 15, pageH - 8, { align: 'right' });
  }
};

// Patient Record PDF
export const exportPatientPDF = (patient: any) => {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  
  addHospitalHeader(doc);
  
  // Title
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 36, pageW, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT MEDICAL RECORD', pageW / 2, 44, { align: 'center' });
  
  let y = 56;
  
  // Patient Info Box
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.rect(15, y, pageW - 30, 50);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('PATIENT INFORMATION', 20, y + 8);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  
  const col1 = 20, col2 = 110;
  
  doc.setFont('helvetica', 'bold'); doc.text('MRN:', col1, y + 18); doc.setFont('helvetica', 'normal'); doc.text(patient.id, col1 + 25, y + 18);
  doc.setFont('helvetica', 'bold'); doc.text('Name:', col1, y + 26); doc.setFont('helvetica', 'normal'); doc.text(patient.name, col1 + 25, y + 26);
  doc.setFont('helvetica', 'bold'); doc.text('Age/Gender:', col1, y + 34); doc.setFont('helvetica', 'normal'); doc.text(`${patient.age} Years / ${patient.gender}`, col1 + 30, y + 34);
  doc.setFont('helvetica', 'bold'); doc.text('DOB:', col1, y + 42); doc.setFont('helvetica', 'normal'); doc.text(patient.dob, col1 + 25, y + 42);
  
  doc.setFont('helvetica', 'bold'); doc.text('Blood Group:', col2, y + 18); doc.setFont('helvetica', 'normal'); doc.text(patient.blood, col2 + 28, y + 18);
  doc.setFont('helvetica', 'bold'); doc.text('Phone:', col2, y + 26); doc.setFont('helvetica', 'normal'); doc.text(patient.phone, col2 + 20, y + 26);
  doc.setFont('helvetica', 'bold'); doc.text('Insurance:', col2, y + 34); doc.setFont('helvetica', 'normal'); doc.text(patient.insurance || 'None', col2 + 25, y + 34);
  doc.setFont('helvetica', 'bold'); doc.text('Reg Date:', col2, y + 42); doc.setFont('helvetica', 'normal'); doc.text(patient.regDate, col2 + 24, y + 42);
  
  y += 60;
  
  // Medical Info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(59, 130, 246);
  doc.text('ALLERGIES', 15, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(patient.allergies?.length ? patient.allergies.join(', ') : 'No known drug allergies (NKDA)', 15, y);
  y += 10;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(59, 130, 246);
  doc.text('CHRONIC CONDITIONS', 15, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(patient.chronic?.length ? patient.chronic.join(', ') : 'None', 15, y);
  y += 14;
  
  // Emergency Contact
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(59, 130, 246);
  doc.text('EMERGENCY CONTACT', 15, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(`${patient.emergency || 'N/A'} | ${patient.emergencyPhone || 'N/A'}`, 15, y);
  y += 14;
  
  // Visit History
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(59, 130, 246);
  doc.text('VISIT HISTORY', 15, y);
  y += 4;
  
  autoTable(doc, {
    startY: y,
    head: [['Visit ID', 'Date', 'Doctor', 'Department', 'Diagnosis', 'Status']],
    body: [
      ['OPD-2345', '2026-06-28', 'Dr. Anand K.', 'Cardiology', 'Hypertension Review', 'Completed'],
      ['OPD-2198', '2026-05-14', 'Dr. Anand K.', 'Cardiology', 'Chest Pain Evaluation', 'Completed'],
      ['OPD-1987', '2026-04-02', 'Dr. Ramesh N.', 'General Medicine', 'Annual Check-up', 'Completed'],
    ],
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [15, 23, 42], textColor: [148, 163, 184] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });
  
  addFooter(doc);
  doc.save(`Patient_Record_${patient.id}_${patient.name.replace(' ', '_')}.pdf`);
};

// Invoice PDF
export const exportInvoicePDF = (bill: any) => {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  
  addHospitalHeader(doc);
  
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 36, pageW, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', pageW / 2, 44, { align: 'center' });
  
  let y = 56;
  
  // Invoice details
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  
  doc.setFont('helvetica', 'bold'); doc.text('Invoice No:', 15, y); doc.setFont('helvetica', 'normal'); doc.text(bill.id, 45, y);
  doc.setFont('helvetica', 'bold'); doc.text('Date:', 120, y); doc.setFont('helvetica', 'normal'); doc.text(bill.date, 135, y);
  y += 8;
  doc.setFont('helvetica', 'bold'); doc.text('Patient:', 15, y); doc.setFont('helvetica', 'normal'); doc.text(bill.patientName, 45, y);
  doc.setFont('helvetica', 'bold'); doc.text('Type:', 120, y); doc.setFont('helvetica', 'normal'); doc.text(bill.type === 'IP' ? 'In-Patient' : 'Out-Patient', 135, y);
  y += 8;
  doc.setFont('helvetica', 'bold'); doc.text('MRN:', 15, y); doc.setFont('helvetica', 'normal'); doc.text(bill.patientId, 45, y);
  doc.setFont('helvetica', 'bold'); doc.text('Payment:', 120, y); doc.setFont('helvetica', 'normal'); doc.text(bill.payment, 135, y);
  y += 12;
  
  // Items table
  autoTable(doc, {
    startY: y,
    head: [['#', 'Description', 'Qty', 'Rate (₹)', 'Amount (₹)']],
    body: bill.items.map((item: any, i: number) => [i + 1, item.desc, item.qty, item.rate.toLocaleString('en-IN'), item.amount.toLocaleString('en-IN')]),
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [15, 23, 42], textColor: [148, 163, 184], fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 10 }, 4: { halign: 'right' }, 3: { halign: 'right' } },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });
  
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  
  // Totals
  const rightX = pageW - 15;
  let fy = finalY;
  
  const addTotal = (label: string, value: string, bold = false) => {
    if (bold) { doc.setFont('helvetica', 'bold'); doc.setFontSize(10); }
    else { doc.setFont('helvetica', 'normal'); doc.setFontSize(9); }
    doc.text(label, rightX - 70, fy);
    doc.text(value, rightX, fy, { align: 'right' });
    fy += 7;
  };
  
  doc.setTextColor(30, 41, 59);
  addTotal('Sub Total:', `₹${bill.subtotal.toLocaleString('en-IN')}`);
  addTotal('Discount:', `-₹${bill.discount.toLocaleString('en-IN')}`);
  addTotal(`GST (9%):`, `₹${bill.gst.toLocaleString('en-IN')}`);
  doc.setDrawColor(200, 200, 200);
  doc.line(rightX - 70, fy - 2, rightX, fy - 2);
  doc.setTextColor(59, 130, 246);
  addTotal('TOTAL:', `₹${bill.total.toLocaleString('en-IN')}`, true);
  doc.setTextColor(16, 185, 129);
  addTotal('Paid:', `₹${bill.paid.toLocaleString('en-IN')}`);
  doc.setTextColor(239, 68, 68);
  addTotal('Balance:', `₹${bill.balance.toLocaleString('en-IN')}`);
  
  // Note
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('This is a computer generated invoice. No signature required.', 15, fy + 5);
  
  addFooter(doc);
  doc.save(`Invoice_${bill.id}_${bill.patientName.replace(' ', '_')}.pdf`);
};

// Generic Table PDF
export const exportTablePDF = (title: string, headers: string[], rows: any[][], filename: string) => {
  const doc = new jsPDF('l', 'mm', 'a4');
  const pageW = doc.internal.pageSize.getWidth();
  
  addHospitalHeader(doc);
  
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 36, pageW, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), pageW / 2, 44, { align: 'center' });
  
  autoTable(doc, {
    startY: 55,
    head: [headers],
    body: rows,
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [15, 23, 42], textColor: [148, 163, 184] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });
  
  addFooter(doc);
  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// =====================================================
// EXCEL UTILITIES
// =====================================================

export const exportToExcel = (data: any[], sheetName: string, filename: string) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Set column widths
  const cols = Object.keys(data[0] || {}).map(() => ({ wch: 20 }));
  ws['!cols'] = cols;
  
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportMultiSheetExcel = (sheets: { name: string; data: any[] }[], filename: string) => {
  const wb = XLSX.utils.book_new();
  
  sheets.forEach(sheet => {
    const ws = XLSX.utils.json_to_sheet(sheet.data);
    const cols = Object.keys(sheet.data[0] || {}).map(() => ({ wch: 20 }));
    ws['!cols'] = cols;
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  });
  
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};
