'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner' // Notification library
import { Calculator } from 'lucide-react'

export default function SaleButton({ productId, productName, sellingPrice, maxQty, recordSale }: any) {
  const [qty, setQty] = useState(1);
  const [method, setMethod] = useState("CASH");
  const [soldPrice, setSoldPrice] = useState(sellingPrice);
  const [loading, setLoading] = useState(false);
  const qtyRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handlePaste = (e: any) => {
      const val = e.detail;
      if (document.activeElement === qtyRef.current) {
        setQty(Math.round(val));
        toast.success(`Pasted ${val} to Quantity`);
      } else if (document.activeElement === priceRef.current) {
        setSoldPrice(val);
        toast.success(`Pasted ${val} to Unit Price`);
      }
    };

    window.addEventListener('paste-to-pos', handlePaste);
    return () => window.removeEventListener('paste-to-pos', handlePaste);
  }, []);

  const handleCompleteSale = async () => {
    // Basic validation
    if (qty < 1) {
      toast.error("Invalid Quantity", { description: "Please enter 1 or more." });
      return;
    }

    if (qty > maxQty) {
      toast.error("Error: Not enough stock!", {
        description: `Available: ${maxQty}`,
        duration: 4000
      });
      return;
    }

    setLoading(true);

    try {
      const result = await recordSale(productId, qty, method, soldPrice);

      if (result?.success) {
        // Play cash register sound
        try {
          const cashSound = new Audio('data:audio/wav;base64,UklGRhQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
          cashSound.volume = 0.4;
          cashSound.play().catch(() => { });
        } catch (e) { }

        toast.success(`${result.count} package of ${result.name} are sold`, {
          description: "View on dashboard",
          duration: 5000,
        });
      }
    } catch (error: any) {
      toast.error("Sale Failed", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Quantity</label>
          <input
            ref={qtyRef}
            type="number"
            value={qty || ''}
            onChange={(e) => setQty(parseInt(e.target.value) || 0)}
            min="1"
            className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl text-center text-white outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Unit Price (Rwf)</label>
          <input
            ref={priceRef}
            type="number"
            value={soldPrice || ''}
            onChange={(e) => setSoldPrice(parseFloat(e.target.value) || 0)}
            className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl text-center text-white outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Payment Method</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl text-sm text-white outline-none focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
        >
          <option value="CASH">Cash Payment</option>
          <option value="MOBILE">Mobile Money / Momo</option>
        </select>
      </div>

      <button
        onClick={handleCompleteSale}
        disabled={loading || qty > maxQty}
        className="w-full bg-blue-600 hover:bg-blue-500 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 text-white shadow-lg shadow-blue-500/20 active:scale-[0.98]"
      >
        {loading ? "Processing..." : "Complete Sale"}
      </button>
    </div>
  );
}