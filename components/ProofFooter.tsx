
import React from 'react';
import { ProofItem } from '../types';
import { Input } from './Common';

interface ProofFooterProps {
  items: ProofItem[];
  onToggle: (id: string) => void;
  onProofChange: (id: string, value: string) => void;
}

const ProofFooter: React.FC<ProofFooterProps> = ({ items, onToggle, onProofChange }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-kod-border z-40 px-24 py-16">
      <div className="max-w-[1400px] mx-auto flex flex-wrap items-center gap-24">
        <span className="text-[11px] font-bold uppercase tracking-widest text-kod-primary opacity-40">
          Proof Checklist
        </span>
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-12 border-l border-kod-border pl-24 first:border-l-0 first:pl-0">
            <button
              onClick={() => onToggle(item.id)}
              className={`w-20 h-20 border transition-all duration-200 flex items-center justify-center ${
                item.completed ? 'bg-kod-success border-kod-success text-white' : 'bg-transparent border-kod-primary'
              }`}
            >
              {item.completed && (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <div className="flex flex-col">
              <span className={`text-[12px] font-semibold ${item.completed ? 'text-kod-success' : 'text-kod-primary'}`}>
                {item.label}
              </span>
              <Input 
                placeholder="Proof (URL/ID)..." 
                value={item.proofValue}
                onChange={(e) => onProofChange(item.id, e.target.value)}
                className="py-4 px-8 text-[10px] w-32 border-none bg-transparent hover:bg-kod-bg focus:bg-kod-bg mt-4"
              />
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
};

export default ProofFooter;
