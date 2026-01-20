'use client'

import React from 'react';

// 1. Define the Animations
const styles = `
  @keyframes antigravity-move-1 {
    0%, 100% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
  }
  @keyframes antigravity-move-2 {
    0%, 100% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(-50px, 50px) scale(1.2); }
    66% { transform: translate(20px, -30px) scale(0.8); }
  }
  @keyframes antigravity-move-3 {
    0%, 100% { transform: translate(0px, 0px) scale(1); }
    50% { transform: translate(50px, 50px) scale(1.1); }
  }
  
  .antigravity-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px); /* Creates the soft gradient effect */
    opacity: 0.6;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }
`;

export function LiveBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full min-h-screen bg-[#0f0c29] font-sans text-white">
      <style>{styles}</style>

      {/* --- ANTIGRAVITY BACKGROUND LAYER --- */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">

        {/* Blob 1: Purple (Left Side) */}
        <div
          className="antigravity-blob bg-purple-600 w-[500px] h-[500px] top-[-100px] left-[-100px]"
          style={{ animation: 'antigravity-move-1 20s infinite alternate' }}
        ></div>

        {/* Blob 2: Cyan/Blue (Right Side) */}
        <div
          className="antigravity-blob bg-cyan-500 w-[600px] h-[600px] top-[-100px] right-[-150px]"
          style={{ animation: 'antigravity-move-2 25s infinite alternate-reverse' }}
        ></div>

        {/* Blob 3: Pink/Magenta (Center/Bottom accent) */}
        <div
          className="antigravity-blob bg-pink-600 w-[400px] h-[400px] bottom-[-100px] left-[30%]"
          style={{ animation: 'antigravity-move-3 22s infinite alternate' }}
        ></div>

        {/* Glass Overlay (Optional: Adds noise/texture if desired) */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
      </div>

      {/* --- CONTENT LAYER --- */}
      {/* z-10 ensures your content is clickable and above the background */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  );
}
