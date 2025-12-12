import React from 'react';

interface LoaderProps {
  text?: string;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ 
  text = "Cargando...", 
  className = "" 
}) => {
  return (
    <div className={`min-h-full flex items-center justify-center bg-[var(--color-background)] text-white ${className}`}>
      <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-t-[var(--color-primary)] border-r-transparent border-b-[var(--color-primary)] border-l-transparent animate-spin mb-4"></div>
          <p className="text-lg text-white/80 font-medium">{text}</p>
      </div>
    </div>
  );
};
