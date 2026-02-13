
import React from 'react';
import { Badge } from './Common';
import { ProjectStatus } from '../types';

interface TopBarProps {
  projectName: string;
  currentStep: number;
  totalSteps: number;
  status: ProjectStatus;
}

const TopBar: React.FC<TopBarProps> = ({ projectName, currentStep, totalSteps, status }) => {
  return (
    <div className="fixed top-0 left-0 right-0 h-64 bg-white border-b border-kod-border z-50 flex items-center justify-between px-24">
      <div className="flex-1 text-sm font-semibold uppercase tracking-widest text-kod-primary">
        {projectName}
      </div>
      <div className="flex-1 flex justify-center text-[13px] font-medium text-kod-primary opacity-60">
        Step {currentStep} / {totalSteps}
      </div>
      <div className="flex-1 flex justify-end">
        <Badge variant={status === ProjectStatus.SHIPPED ? 'success' : 'default'}>
          {status}
        </Badge>
      </div>
    </div>
  );
};

export default TopBar;
