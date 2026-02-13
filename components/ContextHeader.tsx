
import React from 'react';

interface ContextHeaderProps {
  title: string;
  subtitle: string;
}

const ContextHeader: React.FC<ContextHeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="pt-64 pb-40 mb-24 border-b border-kod-border">
      <h1 className="serif-heading text-4xl md:text-5xl mb-16 font-medium text-kod-primary leading-tight">
        {title}
      </h1>
      <p className="text-lg md:text-xl text-kod-primary opacity-70 max-body-width leading-relaxed">
        {subtitle}
      </p>
    </header>
  );
};

export default ContextHeader;
