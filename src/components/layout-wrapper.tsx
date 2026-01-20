'use client'

import { useState } from 'react'
import { Navbar } from './navbar'
import { Sidebar } from './sidebar'
import { Calculator } from './Calculator'

interface LayoutWrapperProps {
    children: React.ReactNode;
    userId: string | null;
    access: {
        isValid: boolean;
        expiryDate: Date | null;
        isLoggedIn: boolean;
        planStatus: string;
        isAdmin: boolean;
    };
}

export function LayoutWrapper({ children, userId, access }: LayoutWrapperProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)

    return (
        <div className="flex flex-col min-h-screen relative">
            <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} isOpen={isSidebarOpen} />

            <div className="flex flex-1 relative pt-[80px]">
                <Sidebar
                    userId={userId}
                    access={access}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    toggleCalculator={() => setIsCalculatorOpen(!isCalculatorOpen)}
                />

                <main className="flex-1 w-full bg-transparent">
                    <div className="container mx-auto px-4 md:px-8 py-8 w-full bg-transparent">
                        {children}
                    </div>
                </main>
            </div>

            <Calculator isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />
        </div>
    )
}
