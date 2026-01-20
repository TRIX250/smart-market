'use client'

import { useState } from 'react'

interface ProductImageProps {
    src: string | null
    alt: string
    className?: string
}

export function ProductImage({ src, alt, className }: ProductImageProps) {
    const [error, setError] = useState(false)

    if (error || !src) {
        return (
            <div className={`rounded-lg bg-white/5 flex items-center justify-center text-slate-500 ${className}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22v-9" /></svg>
            </div>
        )
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setError(true)}
        />
    )
}
