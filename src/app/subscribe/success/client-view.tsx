'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { verifyAndActivateSubscription } from '../../subscription/flutterwave'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function SubscriptionSuccessClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your payment...');

    const transactionId = searchParams.get('transaction_id');
    const statusParam = searchParams.get('status');

    useEffect(() => {
        const verifyPayment = async () => {
            if (statusParam === 'cancelled') {
                setStatus('error');
                setMessage('Payment was cancelled.');
                return;
            }

            if (!transactionId) {
                setStatus('error');
                setMessage('Missing transaction ID.');
                return;
            }

            try {
                const result = await verifyAndActivateSubscription(transactionId);
                if (result.success) {
                    setStatus('success');
                    setMessage('Your subscription is now active! Redirecting to dashboard...');
                    toast.success("Subscription Activated!");
                    setTimeout(() => {
                        router.push('/');
                    }, 3000);
                } else {
                    setStatus('error');
                    setMessage(result.message || 'Verification failed.');
                }
            } catch (err) {
                setStatus('error');
                setMessage('An error occurred during verification.');
            }
        };

        verifyPayment();
    }, [transactionId, statusParam, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl max-w-md w-full shadow-2xl">
                {status === 'loading' && (
                    <div className="space-y-6">
                        <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
                        <h1 className="text-2xl font-bold">Processing...</h1>
                        <p className="text-slate-400">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                        <h1 className="text-2xl font-bold">Payment Successful!</h1>
                        <p className="text-slate-400">{message}</p>
                        <Link href="/" className="inline-block bg-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-500 transition">
                            Go to Dashboard
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                        <h1 className="text-2xl font-bold">Payment Error</h1>
                        <p className="text-slate-400">{message}</p>
                        <Link href="/subscribe" className="inline-block bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition">
                            Try Again
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
