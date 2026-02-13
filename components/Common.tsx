
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'error' | 'success';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "px-24 py-16 transition-all duration-200 ease-in-out text-sm font-medium focus:outline-none disabled:opacity-50";
  
  const variants = {
    primary: "bg-kod-accent text-white hover:opacity-90 active:scale-[0.98]",
    secondary: "border border-kod-primary text-kod-primary hover:bg-kod-primary hover:text-white active:scale-[0.98]",
    error: "border border-kod-accent text-kod-accent hover:bg-kod-accent hover:text-white active:scale-[0.98]",
    success: "bg-kod-success text-white hover:opacity-90 active:scale-[0.98]"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white border border-kod-border p-24 ${className}`}>
    {children}
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input 
    className={`w-full bg-kod-bg border border-kod-border px-16 py-12 focus:border-kod-primary focus:outline-none transition-all duration-200 ${className}`}
    {...props}
  />
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className = '', ...props }) => (
  <textarea 
    className={`w-full bg-kod-bg border border-kod-border px-16 py-12 focus:border-kod-primary focus:outline-none transition-all duration-200 min-h-[120px] resize-none ${className}`}
    {...props}
  />
);

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'default' | 'success' }> = ({ children, variant = 'default' }) => (
  <span className={`px-16 py-8 text-[11px] font-semibold uppercase tracking-wider border ${variant === 'success' ? 'border-kod-success text-kod-success' : 'border-kod-primary text-kod-primary'}`}>
    {children}
  </span>
);
