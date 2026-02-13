
import React, { useState } from 'react';
import { Badge } from './Common';
import { ProjectStatus } from '../types';

interface TopBarProps {
  projectName: string;
  currentRoute: string;
  onNavigate: (route: string) => void;
  status: ProjectStatus;
}

const navLinks = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Saved', path: '/saved' },
  { name: 'Digest', path: '/digest' },
  { name: 'Settings', path: '/settings' },
  { name: 'Proof', path: '/proof' },
];

const TopBar: React.FC<TopBarProps> = ({ projectName, currentRoute, onNavigate, status }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 h-64 bg-white border-b border-kod-border z-50 flex items-center justify-between px-24">
      {/* Left: Project Name (Links to Landing Page) */}
      <div 
        className="flex-1 text-sm font-semibold uppercase tracking-widest text-kod-primary cursor-pointer hover:text-kod-accent transition-colors"
        onClick={() => onNavigate('/')}
      >
        {projectName}
      </div>

      {/* Center: Desktop Navigation */}
      <div className="hidden md:flex items-center gap-24 h-full">
        {navLinks.map((link) => (
          <button
            key={link.path}
            onClick={() => onNavigate(link.path)}
            className={`text-[13px] font-medium tracking-wide transition-all duration-200 h-full px-4 border-b-2 flex items-center ${
              currentRoute === link.path 
                ? 'border-kod-accent text-kod-primary' 
                : 'border-transparent text-kod-primary opacity-60 hover:opacity-100 hover:border-kod-border'
            }`}
          >
            {link.name}
          </button>
        ))}
      </div>

      {/* Right: Status Badge & Mobile Toggle */}
      <div className="flex-1 flex justify-end items-center gap-16">
        <div className="hidden sm:block">
          <Badge variant={status === ProjectStatus.SHIPPED ? 'success' : 'default'}>
            {status}
          </Badge>
        </div>
        
        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-8 text-kod-primary focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? (
            <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 8h16M4 16h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute top-64 left-0 right-0 bg-white border-b border-kod-border md:hidden z-50 shadow-sm">
          <div className="flex flex-col p-24 gap-16">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  onNavigate(link.path);
                  setIsMenuOpen(false);
                }}
                className={`text-left text-lg font-medium py-8 border-l-4 pl-16 transition-colors ${
                  currentRoute === link.path 
                    ? 'border-kod-accent text-kod-accent bg-kod-bg' 
                    : 'border-transparent text-kod-primary opacity-60'
                }`}
              >
                {link.name}
              </button>
            ))}
            <div className="pt-16 mt-8 border-t border-kod-border sm:hidden">
              <Badge variant={status === ProjectStatus.SHIPPED ? 'success' : 'default'}>
                {status}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default TopBar;
