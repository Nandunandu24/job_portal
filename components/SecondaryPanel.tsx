
import React, { useState } from 'react';
import { Card, Button, TextArea } from './Common';

interface SecondaryPanelProps {
  description: string;
  prompt: string;
  onSuccess: () => void;
  onError: () => void;
}

const SecondaryPanel: React.FC<SecondaryPanelProps> = ({ description, prompt, onSuccess, onError }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="w-full md:w-[30%] flex flex-col gap-24">
      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-16 text-kod-primary">Current Objective</h3>
        <p className="text-sm leading-relaxed text-kod-primary opacity-80 mb-24">
          {description}
        </p>
        
        <div className="mb-24">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-kod-primary opacity-50 mb-8">
            Engine Prompt
          </label>
          <div className="relative group">
            <TextArea 
              readOnly 
              value={prompt} 
              className="text-xs font-mono leading-relaxed p-16 h-32"
            />
            <Button 
              onClick={handleCopy}
              className="absolute top-8 right-8 py-4 px-12 text-[10px]"
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-12">
          <Button variant="primary" className="w-full">
            Build in Lovable
          </Button>
          <div className="grid grid-cols-2 gap-12">
            <Button variant="success" onClick={onSuccess} className="w-full py-12 text-xs uppercase">
              It Worked
            </Button>
            <Button variant="error" onClick={onError} className="w-full py-12 text-xs uppercase">
              Error
            </Button>
          </div>
          <Button variant="secondary" className="w-full text-xs py-12 uppercase">
            Add Screenshot
          </Button>
        </div>
      </Card>
    </aside>
  );
};

export default SecondaryPanel;
