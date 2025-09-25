import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ReceiptData } from '../types';
import { SheetIcon } from './icons/SheetIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ExportIcon } from './icons/ExportIcon';
import { PdfIcon } from './icons/PdfIcon';
import { DriveIcon } from './icons/DriveIcon';

interface ReceiptTableProps {
  receipts: ReceiptData[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onImageClick: (receipt: ReceiptData) => void;
}

export const ReceiptTable: React.FC<ReceiptTableProps> = ({ receipts, onEdit, onDelete, onImageClick }) => {
  const handleExportCSV = () => {
    if (receipts.length === 0) return;

    const headers = [
      'Receipt ID', 'Invoice Number', 'Date', 'Vendor Name', 'Address', 'TIN', 'Sold To', 
      'Sale Type', 'Receipt Total Amount', 'Payment Method', 'Authorized Representative', 
      'Item Name', 'Item Quantity', 'Item Unit Price', 'Item Amount'
    ];

    const escapeCSV = (value: any): string => {
        if (value === null || value === undefined) {
            return '""';
        }
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
    };

    const csvRows = [headers.join(',')];

    for (const receipt of receipts) {
        const commonReceiptData = [
            receipt.id,
            receipt.invoiceNumber,
            receipt.date,
            receipt.vendorName,
            receipt.address,
            receipt.tin,
            receipt.soldTo,
            receipt.saleType,
            receipt.totalAmount,
            receipt.paymentMethod,
            receipt.authorizedRepresentative
        ];

        if (receipt.items.length > 0) {
            for (const item of receipt.items) {
                const itemData = [
                    item.name,
                    item.quantity,
                    item.unitPrice,
                    item.amount
                ];
                const row = [...commonReceiptData, ...itemData].map(escapeCSV);
                csvRows.push(row.join(','));
            }
        } else {
            // Handle receipts with no items
            const itemData = ['', '', '', '']; // Empty item fields
            const row = [...commonReceiptData, ...itemData].map(escapeCSV);
            csvRows.push(row.join(','));
        }
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `receipts-export-${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleExportSinglePDF = async (receipt: ReceiptData) => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 15;

    // Title
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Receipt Details', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Add image
    if (receipt.imageUrl) {
        try {
            const img = new Image();
            img.src = receipt.imageUrl;
            await new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });

            const mimeType = receipt.imageUrl.substring(receipt.imageUrl.indexOf(':') + 1, receipt.imageUrl.indexOf(';'));
            const imageFormat = mimeType.split('/')[1].toUpperCase();
            
            const aspectRatio = img.width / img.height;
            const pdfImageWidth = 80;
            const pdfImageHeight = pdfImageWidth / aspectRatio;

            const imageX = (pageWidth - pdfImageWidth) / 2;
            doc.addImage(img, imageFormat, imageX, yPos, pdfImageWidth, pdfImageHeight);
            yPos += pdfImageHeight + 10;
        } catch (e) {
            console.error("Error adding image to PDF:", e);
        }
    }
    
    // Vendor and Invoice Details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Vendor:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(receipt.vendorName, 50, yPos);

    doc.setFont('helvetica', 'bold');
    doc.text('Invoice #:', pageWidth / 2, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(receipt.invoiceNumber, pageWidth / 2 + 25, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'bold');
    doc.text('Address:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(receipt.address, 50, yPos, { maxWidth: pageWidth / 2 - 55 });

    doc.setFont('helvetica', 'bold');
    doc.text('Date:', pageWidth / 2, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(receipt.date, pageWidth / 2 + 25, yPos);
    yPos += 14;

    // Items table
    autoTable(doc, {
        startY: yPos,
        head: [['Item Name', 'Quantity', 'Unit Price', 'Amount']],
        body: receipt.items.map(item => [
            item.name,
            item.quantity,
            `$${item.unitPrice.toFixed(2)}`,
            `$${item.amount.toFixed(2)}`
        ]),
        theme: 'striped',
        headStyles: { fillColor: [75, 85, 99] },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const totalAmountText = `Total Amount: $${receipt.totalAmount.toFixed(2)}`;
    const textWidth = doc.getTextWidth(totalAmountText);
    doc.text(totalAmountText, pageWidth - 15 - textWidth, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const paymentText = `Payment Method: ${receipt.paymentMethod}`;
    const paymentTextWidth = doc.getTextWidth(paymentText);
    doc.text(paymentText, pageWidth - 15 - paymentTextWidth, yPos);

    const fileName = `receipt-${receipt.invoiceNumber.replace(/\s+/g, '_') || receipt.id}.pdf`;
    doc.save(fileName);
  };
  
  const handleExportAllPDF = async () => {
    if (receipts.length === 0) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    for (let i = 0; i < receipts.length; i++) {
        const receipt = receipts[i];

        if (i > 0) {
            doc.addPage();
        }

        let yPos = 15;

        // Title for each receipt page
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(`Receipt: ${receipt.invoiceNumber}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        // Add image
        if (receipt.imageUrl) {
            try {
                const img = new Image();
                img.src = receipt.imageUrl;
                await new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
                
                const mimeType = receipt.imageUrl.substring(receipt.imageUrl.indexOf(':') + 1, receipt.imageUrl.indexOf(';'));
                const imageFormat = mimeType.split('/')[1]?.toUpperCase() || 'PNG';
                
                const aspectRatio = img.width / img.height;
                const pdfImageWidth = 60;
                let pdfImageHeight = pdfImageWidth / aspectRatio;
                
                if (yPos + pdfImageHeight > pageHeight - 20) {
                   pdfImageHeight = pageHeight - yPos - 20;
                }

                const imageX = (pageWidth - pdfImageWidth) / 2;
                doc.addImage(img, imageFormat, imageX, yPos, pdfImageWidth, pdfImageHeight);
                yPos += pdfImageHeight + 10;
            } catch (e) {
                console.error("Error adding image to PDF:", e);
                yPos += 5;
            }
        }
        
        // Vendor and Invoice Details
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Vendor:', 15, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(receipt.vendorName, 40, yPos);

        doc.setFont('helvetica', 'bold');
        doc.text('Invoice #:', pageWidth / 2, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(receipt.invoiceNumber, pageWidth / 2 + 25, yPos);
        yPos += 7;

        doc.setFont('helvetica', 'bold');
        doc.text('Address:', 15, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(receipt.address, 40, yPos, { maxWidth: pageWidth / 2 - 45 });

        doc.setFont('helvetica', 'bold');
        doc.text('Date:', pageWidth / 2, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(receipt.date, pageWidth / 2 + 25, yPos);
        yPos += 14;

        // Items table
        autoTable(doc, {
            startY: yPos,
            head: [['Item Name', 'Quantity', 'Unit Price', 'Amount']],
            body: receipt.items.map(item => [
                item.name,
                item.quantity,
                `$${item.unitPrice.toFixed(2)}`,
                `$${item.amount.toFixed(2)}`
            ]),
            theme: 'striped',
            styles: { fontSize: 8 },
            headStyles: { fontSize: 9, fillColor: [75, 85, 99] },
            margin: { left: 15, right: 15 },
        });
        
        yPos = (doc as any).lastAutoTable.finalY + 10;

        // Summary
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        const totalAmountText = `Total Amount: $${receipt.totalAmount.toFixed(2)}`;
        const textWidth = doc.getTextWidth(totalAmountText);
        doc.text(totalAmountText, pageWidth - 15 - textWidth, yPos);
        yPos += 7;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const paymentText = `Payment Method: ${receipt.paymentMethod}`;
        const paymentTextWidth = doc.getTextWidth(paymentText);
        doc.text(paymentText, pageWidth - 15 - paymentTextWidth, yPos);
    }
    
    const timestamp = new Date().toISOString().slice(0, 10);
    doc.save(`receipts-export-${timestamp}.pdf`);
  };

  if (receipts.length === 0) {
    return (
       <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 text-center">
        <p className="text-slate-500 dark:text-slate-400">Your search returned no results. Try a different query.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <SheetIcon className="h-6 w-6" />
          Receipts Sheet
        </h2>
        <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={receipts.length === 0}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Export current receipts to CSV"
            >
              <ExportIcon className="h-5 w-5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportAllPDF}
              disabled={receipts.length === 0}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Export all visible receipts to PDF"
            >
              <PdfIcon className="h-5 w-5" />
              <span>Export PDF</span>
            </button>
            <a
              href="https://drive.google.com/drive/folders/1gTU-o-y0nA_zX7sywXjTlm3LpSv00VWO?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-800 transition-colors duration-200"
              aria-label="View receipts in Google Drive"
            >
              <DriveIcon className="h-5 w-5" />
              <span>View in Drive</span>
            </a>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300">
            <tr>
              <th scope="col" className="px-6 py-3 rounded-l-lg">Image</th>
              <th scope="col" className="px-6 py-3">Invoice #</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Vendor</th>
              <th scope="col" className="px-6 py-3">Sold To</th>
              <th scope="col" className="px-6 py-3">Items</th>
              <th scope="col" className="px-6 py-3">Total Amount</th>
              <th scope="col" className="px-6 py-3 rounded-r-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((receipt) => (
              <tr key={receipt.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/20 transition-colors duration-200">
                <td className="px-6 py-4">
                  <img
                    src={receipt.imageUrl}
                    alt={`Receipt for ${receipt.vendorName}`}
                    className="h-12 w-16 object-cover rounded-md cursor-pointer hover:scale-110 transition-transform duration-200"
                    onClick={() => onImageClick(receipt)}
                    aria-label={`View image for receipt ${receipt.invoiceNumber}`}
                  />
                </td>
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{receipt.invoiceNumber}</td>
                <td className="px-6 py-4">{receipt.date}</td>
                <td className="px-6 py-4">{receipt.vendorName}</td>
                <td className="px-6 py-4">{receipt.soldTo}</td>
                <td className="px-6 py-4 max-w-xs" title={receipt.items.map(item => `${item.name} (${item.quantity} x $${item.unitPrice.toFixed(2)} = $${item.amount.toFixed(2)})`).join('\n')}>
                  {receipt.items.length > 0 ? `${receipt.items.length} item(s)` : 'No items'}
                </td>
                <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">${receipt.totalAmount.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => onEdit(receipt.id)} className="p-2 text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors" aria-label={`Edit receipt ${receipt.invoiceNumber}`}>
                        <EditIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => onDelete(receipt.id)} className="p-2 text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors" aria-label={`Delete receipt ${receipt.invoiceNumber}`}>
                        <TrashIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleExportSinglePDF(receipt)} className="p-2 text-slate-500 hover:text-green-500 dark:hover:text-green-400 transition-colors" aria-label={`Export receipt ${receipt.invoiceNumber} as PDF`}>
                        <PdfIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};