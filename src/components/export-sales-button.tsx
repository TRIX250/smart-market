'use client'

import { FileSpreadsheet, FileText } from 'lucide-react'
import { exportToExcel } from '@/lib/excel-utils'
import { exportToPDF } from '@/lib/pdf-utils'
import { useState, useEffect } from 'react'

interface ExportSalesButtonProps {
    sales: any[]
}

export function ExportSalesButton({ sales }: ExportSalesButtonProps) {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        setIsAuthorized(true);
    }, []);

    const getColumns = () => [
        { header: 'Date', key: 'createdAt' },
        { header: 'Product Name', key: 'product.name' },
        { header: 'Quantity', key: 'quantity' },
        { header: 'Total Amount', key: 'totalAmount' },
        { header: 'Profit', key: 'profit' },
        { header: 'Payment Method', key: 'paymentMethod' },
        { header: 'Status', key: 'status' }
    ];

    const handleExportExcel = () => {
        exportToExcel(sales, 'SmartMarket_Sales_Report', getColumns());
    };

    const handleExportPDF = () => {
        exportToPDF(sales, 'SmartMarket_Sales_Report', getColumns());
    };

    if (isAuthorized === false) return null;

    return (
        <div className="flex items-center gap-1 md:gap-2 print:hidden">
            <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3 md:px-4 py-2 rounded-lg font-bold transition shadow-lg shadow-emerald-500/20 text-xs md:text-sm"
                title="Export to Excel"
            >
                <FileSpreadsheet size={16} />
                <span className="hidden xs:inline">Excel</span>
            </button>
            <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-3 md:px-4 py-2 rounded-lg font-bold transition shadow-lg shadow-red-500/20 text-xs md:text-sm"
                title="Export to PDF"
            >
                <FileText size={16} />
                <span className="hidden xs:inline">PDF</span>
            </button>
        </div>
    );
}
