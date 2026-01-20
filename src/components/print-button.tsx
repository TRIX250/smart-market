'use client'

import { Printer } from 'lucide-react';

export default function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold transition print:hidden"
        >
            <Printer className="w-4 h-4" />
            Print / Save PDF
        </button>
    );
}
