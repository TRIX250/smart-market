'use client'

interface ReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  saleData: {
    name: string;
    count: number;
    price: number;
    total: number;
    method: string;
  } | null;
}

export default function ReceiptModal({ isOpen, onClose, saleData }: ReceiptProps) {
  if (!isOpen || !saleData) return null;

  const rwf = (val: number) => `Rwf ${new Intl.NumberFormat('en-RW').format(val)}`;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 w-full max-w-sm rounded-xl overflow-hidden shadow-2xl font-mono">
        <div className="p-6 border-b border-dashed border-slate-300 text-center">
          <h2 className="text-xl font-black uppercase tracking-widest">SmartMarket</h2>
          <p className="text-[10px] text-slate-500 mt-1">Kigali, Rwanda</p>
          <p className="text-[10px] text-slate-400 uppercase">{new Date().toLocaleString()}</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="font-bold">{saleData.name} (x{saleData.count})</span>
            <span>{rwf(saleData.total)}</span>
          </div>
          
          <div className="border-t border-dashed border-slate-200 pt-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Payment Method:</span>
              <span className="font-bold uppercase">{saleData.method}</span>
            </div>
            <div className="flex justify-between text-lg font-black border-t border-slate-900 pt-2">
              <span>TOTAL</span>
              <span>{rwf(saleData.total)}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 flex flex-col gap-2">
          <button 
            onClick={() => window.print()} 
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            Print Receipt
          </button>
          <button 
            onClick={onClose}
            className="w-full text-slate-500 text-xs py-1 hover:text-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}