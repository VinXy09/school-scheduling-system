import React, { useEffect, useState } from 'react';

const WelcomeLoading = ({ onComplete, username, role }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Format role for display: super_admin -> Super Admin
  const formatRole = (roleStr) => {
    if (!roleStr) return '';
    return roleStr
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    // Show the welcome screen for 2.5 seconds, then start fade out
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2500);

    // Complete the transition and unmount after 3 seconds
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${isFadingOut ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
         style={{ 
           backgroundColor: '#1a2e05',
           backgroundImage: `
             radial-gradient(circle at 20% 80%, rgba(132, 204, 22, 0.1) 0%, transparent 25%),
             radial-gradient(circle at 80% 20%, rgba(251, 191, 36, 0.08) 0%, transparent 25%)
           `
         }}>
      
      <div className="relative mb-8 transform transition-all duration-1000 animate-bounce-slow">
        <div className="absolute inset-0 bg-lime-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="relative bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl">
          <img 
            src="logo_2.png" 
            alt="School Logo" 
            className="w-32 h-32 object-contain"
          />
        </div>
      </div>

      <div className="text-center space-y-4 px-6 max-w-lg">
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight animate-fade-in-up">
          Hi! <span className="text-lime-400">{username || 'User'}</span>
        </h2>
        
        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
          <span className="text-white/80 font-medium tracking-wide">
            {formatRole(role) || 'Administrator'}
          </span>
        </div>
      </div>

      <div className="absolute bottom-12 flex flex-col items-center gap-3 animate-fade-in" style={{ animationDelay: '600ms' }}>
        <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="w-full h-full bg-lime-500 origin-left animate-loading-bar"></div>
        </div>
        <p className="text-white/30 text-xs font-black uppercase tracking-[0.4em]">
          Entering Dashboard
        </p>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes loadingBar {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        .animate-loading-bar {
          animation: loadingBar 2.5s ease-in-out forwards;
        }
        .animate-bounce-slow {
          animation: bounceSlow 3s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

export default WelcomeLoading;
