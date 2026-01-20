import * as XLSX from 'xlsx';

/**
 * Exports JSON data to an Excel file with specific column labels and formatting.
 * @param data Array of objects to export
 * @param filename Name of the file (without extension)
 * @param columns Array of objects defining header labels and the corresponding keys in data [{ header: 'Name', key: 'name' }]
 */
export function exportToExcel(data: any[], filename: string, columns: { header: string, key: string }[]) {
    // Map data to the desired column structure
    const formattedData = data.map(item => {
        const row: any = {};
        columns.forEach(col => {
            let value = item[col.key];

            // Handle nested properties if key has dots (e.g., 'product.name')
            if (col.key.includes('.')) {
                value = col.key.split('.').reduce((obj, key) => obj?.[key], item);
            }

            // Format dates specifically for Rwandan standards (DD/MM/YYYY)
            if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)) && col.key.toLowerCase().includes('date'))) {
                const date = new Date(value);
                value = date.toLocaleDateString('en-RW', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            }

            row[col.header] = value;
        });
        return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    // Download the file
    XLSX.writeFile(workbook, `${filename}.xlsx`);
}
