import React from 'react';
import { Card } from './Common';

interface SecondaryPanelProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

const SecondaryPanel: React.FC<SecondaryPanelProps> = ({ title, description, children }) => {
  return (
    <aside className="w-full md:w-[30%] flex flex-col gap-24">
      <Card>
        <h3 className="text-[11px] font-bold uppercase tracking-widest mb-16 text-kod-primary opacity-50">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-kod-primary opacity-80 mb-24">
          {description}
        </p>
        {children}
      </Card>
      
      <div className="px-8 opacity-40">
        <h4 className="text-[10px] font-bold uppercase tracking-widest mb-8">System Status</h4>
        <div className="flex items-center gap-8">
          <div className="w-6 h-6 rounded-full bg-kod-success"></div>
          <span className="text-[10px]">Cloud Engine Active</span>
        </div>
      </div>
    </aside>
  );
};

export default SecondaryPanel;