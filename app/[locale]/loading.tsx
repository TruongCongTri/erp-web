import React from "react";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background">
      {/* 
        Using a standard <img> tag instead of next/image here is intentional. 
        It bypasses lazy loading and blur-up effects to ensure the logo 
        renders absolutely instantly the millisecond the screen appears.
      */}
      <div className="relative flex flex-col items-center justify-center animate-pulse duration-1000">
        <img
          src="/icon.png"
          alt="Chính Nam Loading..."
          className="w-20 h-20 object-contain drop-shadow-md"
        />
        <span>Chính Nam Loading...</span>
        {/* Optional: A tiny subtle loading spinner at the bottom (like Facebook/Meta does) */}
        <div className="absolute -bottom-12 flex space-x-1.5">
          <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-primary/80 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
