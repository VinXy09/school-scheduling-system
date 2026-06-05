import React, { useEffect, useState } from 'react';

const SplashLoading = ({ onComplete }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Start fade out at 4s
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 4000);

    // The animation takes 4 seconds. Wait 4.5 seconds to unmount smoothly.
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4500);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="relative w-48 h-48 md:w-64 md:h-64 drop-shadow-2xl">
        {/* Base Layer: Grayscale version to show outline */}
        <img 
          src="logo_2.png" 
          alt="School Logo Base" 
          className="absolute inset-0 w-full h-full object-contain filter grayscale opacity-20" 
        />
        
        {/* Animated Layer: Full Color filling from bottom */}
        <img 
          src="logo_2.png" 
          alt="School Logo Fill" 
          className="absolute inset-0 w-full h-full object-contain animate-logo-fill" 
        />
      </div>
      
      <div className="mt-12 text-xs md:text-sm font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
        Initializing System
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes logoFillUp {
          0% {
            clip-path: inset(100% 0 0 0);
          }
          50% {
            /* optional: slight bounce effect during load */
            clip-path: inset(45% 0 0 0);
          }
          100% {
            clip-path: inset(0 0 0 0);
          }
        }
        .animate-logo-fill {
          /* Using an easeInOut effect for smooth fluid filling */
          animation: logoFillUp 4s cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }
      `}} />
    </div>
  );
};

export default SplashLoading;
