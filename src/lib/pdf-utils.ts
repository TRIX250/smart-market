import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Column {
    header: string;
    key: string;
}

export const exportToPDF = (data: any[], title: string, columns: Column[]) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(title.replace(/_/g, ' '), 14, 22);

    // Date
    doc.setFontSize(11);
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
            if (typeof value === 'number' && (col.key.toLowerCase().includes('price') || col.key.toLowerCase().includes('amount'))) {
                return `Rwf ${value.toLocaleString()}`;
            }

            return value;
        });
    });

    autoTable(doc, {
        head: tableHead,
        body: tableBody,
        startY: 40,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [22, 163, 74] }, // Emerald-600 like
    });

    doc.save(`${title}.pdf`);
};
