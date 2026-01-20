'use client'

import React, { useEffect, useState } from 'react'

export function AnimatedBackground() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <>
            <div className="mesh-gradient" />
            <div className="grid-overlay" />
            <div className="floating-particles">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="particle"
                        style={{
                            // @ts-ignore
                            '--duration': `${15 + Math.random() * 20}s`,
                            '--delay': `${Math.random() * 20}s`,
                            '--left': `${Math.random() * 100}%`,
                            '--size': `${1 + Math.random() * 3}px`,
                        }}
                    />
                ))}
            </div>
        </>
    )
}
