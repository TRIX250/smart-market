import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Column {
    header: string;
    key: string;
}

export interface SummaryField {
    label: string;
    value: string;
}

export const exportToPDF = (data: any[], title: string, columns: Column[], summaries?: SummaryField[]) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.setTextColor(30);
    doc.text(title.replace(/_/g, ' '), 14, 22);

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100);
    const dateStr = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    doc.text(`Generated on: ${dateStr}`, 14, 30);

    let startY = 40;

    // Summary Section (if provided)
    if (summaries && summaries.length > 0) {
        // Draw a subtle background box for the performance summary
        const summaryHeight = (summaries.length * 9) + 12;
        doc.setFillColor(248, 250, 252); // Slate-50 background
        doc.roundedRect(14, 38, 182, summaryHeight, 2, 2, 'F');

        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59); // Slate-800
        doc.setFont('helvetica', 'bold');
        doc.text('PERFORMANCE SUMMARY', 18, 46);

        let summaryY = 54;
        doc.setFontSize(9);

        summaries.forEach((sum) => {
            // Label
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105); // Slate-600
            doc.text(`${sum.label}:`, 18, summaryY);

            // Value - moved to x=120 to completely avoid overlap with long labels
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(22, 163, 74); // Emerald-600
            doc.text(sum.value, 120, summaryY);

            summaryY += 8;
        });

        startY = 38 + summaryHeight + 10;
    }


    // Prepare table data
    const tableHead = [columns.map(c => c.header)];
    const tableBody = data.map(row => {
        return columns.map(col => {
            // Handle nested keys (e.g. 'product.name')
            const keys = col.key.split('.');
            let value = row;
            for (const k of keys) {
                value = value ? value[k] : '';
            }

            // Format dates
            if (col.key.toLowerCase().includes('date') || col.key.includes('At')) {
                try {
                    return new Date(value).toLocaleDateString();
                } catch (e) {
                    return value;
                }
            }

            // Format money (simple loose check for currency/amount columns)
            if (typeof value === 'number' && (col.key.toLowerCase().includes('price') || col.key.toLowerCase().includes('amount') || col.key.toLowerCase().includes('profit'))) {
                return `Rwf ${value.toLocaleString()}`;
            }

            return value;
        });
    });

    autoTable(doc, {
        head: tableHead,
        body: tableBody,
        startY: startY,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [22, 163, 74] }, // Emerald-600 like
        margin: { top: 10 }
    });

    doc.save(`${title}.pdf`);
};

