import { Suspense } from 'react';
import SubscriptionSuccessClient from './client-view';

// Force dynamic rendering to treat this route as runtime-only
export const dynamic = 'force-dynamic';

export default function SubscriptionSuccessPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
                <div className="text-white">Loading payment verification...</div>
            </div>
        }>
            <SubscriptionSuccessClient />
        </Suspense>
    );
}
