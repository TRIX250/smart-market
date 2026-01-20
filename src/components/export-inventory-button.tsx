'use client'

import { Download, Lock, FileText } from 'lucide-react'
import { exportToExcel } from '@/lib/excel-utils'
import { exportToPDF } from '@/lib/pdf-utils'
import { useState, useEffect } from 'react'
import { auth } from '@clerk/nextjs/server'

interface ExportInventoryButtonProps {
    products: any[]
}

export function ExportInventoryButton({ products }: ExportInventoryButtonProps) {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        setIsAuthorized(true);
    }, []);

    const getColumns = () => [
        { header: 'Product Name', key: 'name' },
        { header: 'SKU', key: 'sku' },
        { header: 'Cost Price', key: 'costPrice' },
        { header: 'Selling Price', key: 'sellingPrice' },
        { header: 'Stock Level', key: 'stockQty' },
        { header: 'Category', key: 'category' },
        { header: 'Updated At', key: 'updatedAt' }
    ];

    const handleExportExcel = () => {
        exportToExcel(products, 'SmartMarket_Inventory', getColumns());
    };

    const handleExportPDF = () => {
        exportToPDF(products, 'SmartMarket_Inventory', getColumns());
    };

    if (isAuthorized === false) return null;

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold transition shadow-lg shadow-emerald-500/20 text-sm"
            >
                <Download size={16} />
                Excel
            </button>
            <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold transition shadow-lg shadow-red-500/20 text-sm"
            >
                <FileText size={16} />
                PDF
            </button>
        </div>
    );
}
