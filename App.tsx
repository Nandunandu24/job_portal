
import React, { useState, useCallback } from 'react';
import { ProjectStatus, ProofItem } from './types';
import { INITIAL_STEPS, INITIAL_PROOF_CHECKLIST } from './constants';
import TopBar from './components/TopBar';
import ContextHeader from './components/ContextHeader';
import SecondaryPanel from './components/SecondaryPanel';
import ProofFooter from './components/ProofFooter';
import { Card, Button } from './components/Common';

const App: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(1);
  const [proofItems, setProofItems] = useState<ProofItem[]>(INITIAL_PROOF_CHECKLIST);
  const currentStep = INITIAL_STEPS[currentStepIndex] || INITIAL_STEPS[0];

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

  const handleStepSuccess = () => {
    if (currentStepIndex < INITIAL_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleStepError = () => {
    console.log("Error state triggered for current step.");
    // In a real app, this would show a helpful error modal or state
  };

  return (
    <div className="min-h-screen bg-kod-bg selection:bg-kod-accent selection:text-white pb-80">
      <TopBar 
        projectName="KodNest Premium Build"
        currentStep={currentStepIndex + 1}
        totalSteps={INITIAL_STEPS.length}
        status={currentStepIndex === INITIAL_STEPS.length - 1 && proofItems.every(p => p.completed) ? ProjectStatus.SHIPPED : ProjectStatus.IN_PROGRESS}
      />

      <main className="max-w-[1400px] mx-auto px-24 pt-24">
        <ContextHeader 
          title={currentStep.title}
          subtitle={currentStep.description}
        />

        <div className="flex flex-col md:flex-row gap-40">
          {/* Primary Workspace (70%) */}
          <div className="w-full md:w-[70%]">
            <Card className="min-h-[400px] flex flex-col">
              <div className="mb-40">
                <h2 className="text-xl font-bold text-kod-primary mb-16">Integration Environment</h2>
                <div className="max-body-width text-kod-primary opacity-80 leading-relaxed mb-24">
                  This workspace is reserved for direct interaction with the build engine. Components placed here are processed in real-time to ensure coherence with the KodNest design system.
                </div>
                
                <div className="p-40 border border-kod-border border-dashed bg-kod-bg flex flex-col items-center justify-center text-center opacity-60">
                  <svg className="w-48 h-48 mb-16 text-kod-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-sm">Ready for deployment commands</p>
                </div>
              </div>

              <div className="mt-auto pt-24 border-t border-kod-border flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase tracking-widest opacity-40">Primary Output Console</span>
                <Button variant="secondary" className="text-xs py-8 px-16">
                  Clear Workspace
                </Button>
              </div>
            </Card>

            <div className="mt-40 max-body-width">
              <h3 className="serif-heading text-2xl mb-16 font-medium">Design System Integrity</h3>
              <p className="text-kod-primary opacity-70 leading-relaxed mb-24">
                The KodNest Premium Build System maintains a strict boundary between experimentation and production. All code generated must pass through the proof checklist before being eligible for the final shipment.
              </p>
            </div>
          </div>

          {/* Secondary Panel (30%) */}
          <SecondaryPanel 
            description={currentStep.description}
            prompt={currentStep.prompt}
            onSuccess={handleStepSuccess}
            onError={handleStepError}
          />
        </div>
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
