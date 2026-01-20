import { Clock, Crown, LayoutDashboard, Shield } from 'lucide-react'

export function getDaysLeft(expiryDate: Date | string | null | undefined): number {
    if (!expiryDate) return 0;

    const expiry = new Date(expiryDate);
    const now = new Date();

    // Difference in milliseconds
    const diff = expiry.getTime() - now.getTime();

    // Check if expired
    if (diff <= 0) return 0;

    // Convert to days (rounding up)
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function SubscriptionBadge({ expiryDate }: { expiryDate: Date | string | null | undefined }) {
    const days = getDaysLeft(expiryDate);

    if (days <= 0) {
        return (
            <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-red-500/20">
                Expired
            </span>
        );
    }

    return (
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border ${days <= 3
            ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
            : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            }`}>
            Access Life: {days} Days Left
        </span>
    );
}
