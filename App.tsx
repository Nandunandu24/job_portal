
import React, { useState, useCallback } from 'react';
import { ProjectStatus, ProofItem } from './types';
import { INITIAL_PROOF_CHECKLIST } from './constants';
import TopBar from './components/TopBar';
import ContextHeader from './components/ContextHeader';
import ProofFooter from './components/ProofFooter';
import { Card } from './components/Common';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState('/dashboard');
  const [proofItems, setProofItems] = useState<ProofItem[]>(INITIAL_PROOF_CHECKLIST);

  const handleToggleProof = useCallback((id: string) => {
    setProofItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  }, []);

  const handleProofChange = useCallback((id: string, value: string) => {
    setProofItems(prev => prev.map(item => 
      item.id === id ? { ...item, proofValue: value } : item
    ));
  }, []);

  const getPageTitle = (route: string) => {
    if (route === '/') return 'KodNest Home';
    const clean = route.slice(1);
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  };

  const renderContent = () => {
    const pageName = getPageTitle(currentRoute);
    
    return (
      <div className="flex flex-col md:flex-row gap-40">
        {/* Primary Workspace (70% width) */}
        <div className="w-full md:w-[70%]">
          <Card className="min-h-[480px] flex flex-col items-center justify-center border-dashed border-2 bg-white/50">
            <div className="text-center px-24">
              <h2 className="serif-heading text-5xl md:text-6xl mb-24 text-kod-primary font-medium tracking-tight">
                {pageName}
              </h2>
              <p className="text-lg text-kod-primary opacity-50 max-body-width mx-auto leading-relaxed">
                This section will be built in the next step.
              </p>
            </div>
          </Card>
        </div>
        
        {/* Secondary Panel (30% width) */}
        <aside className="w-full md:w-[30%]">
          <div className="flex flex-col gap-24">
            <Card className="bg-kod-bg/30 border-dashed border-2">
              <div className="flex flex-col gap-16">
                <div className="h-12 w-2/3 bg-kod-border/40 rounded-sm"></div>
                <div className="h-12 w-1/2 bg-kod-border/30 rounded-sm"></div>
                <div className="h-32 w-full bg-kod-border/10 rounded-sm mt-16 border border-kod-border/20"></div>
                <div className="flex gap-12 mt-8">
                  <div className="h-40 w-full bg-kod-border/20 rounded-sm"></div>
                  <div className="h-40 w-full bg-kod-border/20 rounded-sm"></div>
                </div>
              </div>
            </Card>
            
            <div className="px-8">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-kod-primary opacity-40 mb-12">
                System Context
              </h4>
              <p className="text-xs leading-relaxed text-kod-primary opacity-50">
                The tracker environment is currently in isolation mode. Navigate between modules to verify the routing architecture.
              </p>
            </div>
          </div>
        </aside>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-kod-bg selection:bg-kod-accent selection:text-white pb-80">
      <TopBar 
        projectName="KodNest Premium"
        currentRoute={currentRoute}
        onNavigate={setCurrentRoute}
        status={proofItems.every(p => p.completed) ? ProjectStatus.SHIPPED : ProjectStatus.IN_PROGRESS}
      />

      <main className="max-w-[1400px] mx-auto px-24 pt-24">
        <ContextHeader 
          title={getPageTitle(currentRoute)}
          subtitle="Building the foundation for the Job Notification Tracker."
        />

        {renderContent()}
      </main>

      <ProofFooter 
        items={proofItems}
        onToggle={handleToggleProof}
        onProofChange={handleProofChange}
      />
    </div>
  );
};

export default App;
