'use client'

import { useState, useEffect, useRef } from 'react'
import { Calculator as CalcIcon, X, Trash2, GripHorizontal, ArrowRightToLine } from 'lucide-react'

interface CalculatorProps {
    isOpen: boolean
    onClose: () => void
}

export function Calculator({ isOpen, onClose }: CalculatorProps) {
    const [display, setDisplay] = useState('0')
    const [previousValue, setPreviousValue] = useState<number | null>(null)
    const [operation, setOperation] = useState<string | null>(null)
    const [newNumber, setNewNumber] = useState(true)

    // Draggable state
    const [position, setPosition] = useState({ x: 100, y: 100 })
    const [isDragging, setIsDragging] = useState(false)
    const dragRef = useRef<HTMLDivElement>(null)
    const offsetRef = useRef({ x: 0, y: 0 })

    const handleNumber = (num: string) => {
        if (newNumber) {
            setDisplay(num)
            setNewNumber(false)
        } else {
            setDisplay(display === '0' ? num : display + num)
        }
    }

    const handleDecimal = () => {
        if (!display.includes('.')) {
            setDisplay(display + '.')
            setNewNumber(false)
        }
    }

    const handleOperation = (op: string) => {
        const current = parseFloat(display)
        if (previousValue !== null && operation && !newNumber) {
            calculate()
        } else {
            setPreviousValue(current)
        }
        setOperation(op)
        setNewNumber(true)
    }

    const calculate = () => {
        if (previousValue === null || operation === null) return
        const current = parseFloat(display)
        let result = 0
        switch (operation) {
            case '+': result = previousValue + current; break;
            case '-': result = previousValue - current; break;
            case '*': result = previousValue * current; break;
            case '/': result = current !== 0 ? previousValue / current : 0; break;
        }
        setDisplay(result.toString())
        setPreviousValue(null)
        setOperation(null)
        setNewNumber(true)
    }

    const clear = () => {
        setDisplay('0')
        setPreviousValue(null)
        setOperation(null)
        setNewNumber(true)
    }

    const handlePaste = () => {
        const val = parseFloat(display);
        if (isNaN(val)) return;

        // Dispatch custom event for POS to hear
        const event = new CustomEvent('paste-to-pos', { detail: val });
        window.dispatchEvent(event);

        // Optional: show a small toast or close
        onClose();
    }

    // Drag Logic
    const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true)
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
        offsetRef.current = {
            x: clientX - position.x,
            y: clientY - position.y
        }
    }

    useEffect(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => {
            if (!isDragging) return
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

            setPosition({
                x: clientX - offsetRef.current.x,
                y: clientY - offsetRef.current.y
            })
        }

        const stopDrag = () => setIsDragging(false)

        if (isDragging) {
            window.addEventListener('mousemove', handleMove)
            window.addEventListener('mouseup', stopDrag)
            window.addEventListener('touchmove', handleMove)
            window.addEventListener('touchend', stopDrag)
        }

        return () => {
            window.removeEventListener('mousemove', handleMove)
            window.removeEventListener('mouseup', stopDrag)
            window.removeEventListener('touchmove', handleMove)
            window.removeEventListener('touchend', stopDrag)
        }
    }, [isDragging])

    if (!isOpen) return null

    return (
        <div
            ref={dragRef}
            className="fixed z-[9999] w-72 md:w-80 shadow-2xl transition-shadow group select-none"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                cursor: isDragging ? 'grabbing' : 'auto'
            }}
        >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                {/* Drag Handle */}
                <div
                    onMouseDown={startDrag}
                    onTouchStart={startDrag}
                    className="h-8 bg-white/5 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors"
                >
                    <GripHorizontal className="w-4 h-4 text-slate-500" />
                </div>

                <div className="p-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                                <CalcIcon className="w-4 h-4 text-blue-400" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Calculator</span>
                        </div>
                        <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Display */}
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-4">
                        <div className="text-right text-3xl font-mono font-black text-white truncate">
                            {display}
                        </div>
                    </div>

                    {/* Buttons Grid */}
                    <div className="grid grid-cols-4 gap-2">
                        {/* Row 1 */}
                        <button onClick={clear} className="col-span-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-black py-4 rounded-xl text-sm transition">AC</button>
                        <button onClick={() => handleOperation('/')} className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-black py-4 rounded-xl text-lgtransition">÷</button>
                        <button onClick={() => handleOperation('*')} className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-black py-4 rounded-xl text-lg transition">×</button>

                        {/* Mid Rows */}
                        {['7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3'].map((item) => {
                            const isOp = ['+', '-'].includes(item);
                            return (
                                <button
                                    key={item}
                                    onClick={() => isOp ? handleOperation(item) : handleNumber(item)}
                                    className={`py-4 rounded-xl font-black text-sm transition ${isOp ? 'bg-blue-600/10 hover:bg-blue-600/20 text-blue-400' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                                >
                                    {item}
                                </button>
                            )
                        })}
                        <button onClick={calculate} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl text-lg shadow-lg shadow-emerald-600/20 transition-all row-span-2">=</button>

                        {/* Last Row */}
                        <button onClick={() => handleNumber('0')} className="col-span-2 bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-xl text-sm transition">0</button>
                        <button onClick={handleDecimal} className="bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-xl text-sm transition">.</button>
                    </div>

                    {/* Send to POS Action */}
                    <button
                        onClick={handlePaste}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 text-xs uppercase tracking-widest"
                    >
                        <ArrowRightToLine className="w-4 h-4" />
                        Send to POS
                    </button>
                </div>
            </div>
        </div>
    )
}
