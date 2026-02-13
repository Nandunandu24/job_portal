import React, { useState, useCallback, useEffect } from 'react';
import { ProjectStatus, ProofItem } from './types';
import { INITIAL_PROOF_CHECKLIST } from './constants';
import TopBar from './components/TopBar';
import ContextHeader from './components/ContextHeader';
import ProofFooter from './components/ProofFooter';
import SecondaryPanel from './components/SecondaryPanel';
import { Card, Button, Input, Badge } from './components/Common';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<string>(window.location.pathname === '/' ? '/' : window.location.pathname);
  const [proofItems, setProofItems] = useState<ProofItem[]>(INITIAL_PROOF_CHECKLIST);

  useEffect(() => {
    const handlePopState = () => setCurrentRoute(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

  const navigate = (path: string) => {
    setCurrentRoute(path);
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Views ---

  const LandingPage = () => (
    <div className="flex flex-col items-center justify-center min-h-[75vh] text-center px-24">
      <h1 className="serif-heading text-6xl md:text-8xl mb-24 text-kod-primary font-medium tracking-tight leading-[1.1]">
        Stop Missing The Right Jobs.
      </h1>
      <p className="text-xl md:text-2xl text-kod-primary opacity-60 max-body-width mb-48 leading-relaxed font-light">
        Precision-matched job discovery delivered daily at 9AM.
      </p>
      <div className="flex flex-col sm:flex-row gap-16">
        <Button variant="primary" onClick={() => navigate('/settings')} className="text-lg px-48 py-20">
          Start Tracking
        </Button>
      </div>
    </div>
  );

  const DashboardPage = () => (
    <div className="flex flex-col gap-40">
      <ContextHeader 
        title="Dashboard" 
        subtitle="View your active job discoveries and match status." 
      />
      <div className="flex flex-col md:flex-row gap-40">
        <div className="w-full md:w-[70%]">
          <Card className="min-h-[520px] flex flex-col items-center justify-center border-dashed border-2 bg-white/40">
            <div className="text-center px-24 max-w-md">
              <h3 className="text-2xl serif-heading mb-12 text-kod-primary">No jobs yet.</h3>
              <p className="text-sm text-kod-primary opacity-50 leading-relaxed mb-32">
                In the next step, you will load a realistic dataset.
              </p>
            </div>
          </Card>
        </div>
        <SecondaryPanel 
          title="Insights" 
          description="Your personalized dashboard provides a bird's-eye view of your job search progress."
        />
      </div>
    </div>
  );

  const SettingsPage = () => (
    <div className="flex flex-col gap-40">
      <ContextHeader 
        title="Settings" 
        subtitle="Add your preferences to calibrate the job discovery engine." 
      />
      <div className="flex flex-col md:flex-row gap-40">
        <div className="w-full md:w-[70%]">
          <Card className="space-y-48 p-40">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-40 gap-y-32">
              <div className="space-y-8">
                <label className="text-[11px] font-bold uppercase tracking-widest opacity-60">Role keywords</label>
                <Input placeholder="e.g. Senior Frontend Engineer" />
              </div>
              <div className="space-y-8">
                <label className="text-[11px] font-bold uppercase tracking-widest opacity-60">Preferred locations</label>
                <Input placeholder="e.g. New York, Remote" />
              </div>
              <div className="space-y-8">
                <label className="text-[11px] font-bold uppercase tracking-widest opacity-60">Mode</label>
                <select className="w-full bg-kod-bg border border-kod-border px-16 py-14 focus:border-kod-primary focus:outline-none transition-premium appearance-none text-sm">
                  <option>Remote</option>
                  <option>Hybrid</option>
                  <option>Onsite</option>
                </select>
              </div>
              <div className="space-y-8">
                <label className="text-[11px] font-bold uppercase tracking-widest opacity-60">Experience level</label>
                <select className="w-full bg-kod-bg border border-kod-border px-16 py-14 focus:border-kod-primary focus:outline-none transition-premium appearance-none text-sm">
                  <option>Junior</option>
                  <option>Mid-level</option>
                  <option>Senior</option>
                  <option>Principal</option>
                </select>
              </div>
            </div>
            <div className="pt-32 border-t border-kod-border flex justify-end">
              <Button variant="primary" className="px-40">Save Preferences</Button>
            </div>
          </Card>
        </div>
        <SecondaryPanel 
          title="Calibration" 
          description="Your preferences are used to filter through thousands of listings daily."
        />
      </div>
    </div>
  );

  const EmptyStatePage = ({ title, desc }: { title: string; desc: string }) => (
    <div className="flex flex-col gap-40">
      <ContextHeader title={title} subtitle={desc} />
      <div className="flex flex-col md:flex-row gap-40">
        <div className="w-full md:w-[70%]">
          <Card className="min-h-[440px] flex flex-col items-center justify-center border-dashed border-2 bg-white/40">
            <div className="text-center px-24 max-w-sm">
              <h3 className="text-2xl serif-heading mb-12 text-kod-primary">No items found.</h3>
              <p className="text-sm text-kod-primary opacity-50 leading-relaxed">
                This section is currently empty. Start interacting with discoveries to see them here.
              </p>
            </div>
          </Card>
        </div>
        <SecondaryPanel 
          title="Module Info" 
          description={`Your ${title.toLowerCase()} collection helps you keep track of long-term goals.`}
        />
      </div>
    </div>
  );

  const ProofPage = () => (
    <div className="flex flex-col gap-40">
      <ContextHeader 
        title="Proof" 
        subtitle="Artifact collection for development validation." 
      />
      <div className="flex flex-col md:flex-row gap-40">
        <div className="w-full md:w-[70%]">
          <Card className="bg-white p-40">
            <h3 className="text-xl serif-heading mb-24">Artifact Collection</h3>
            <div className="space-y-16 opacity-50">
              <p className="text-sm italic">Placeholder for artifacts and build signatures.</p>
              <div className="h-40 w-full bg-kod-bg border border-kod-border/30 rounded-sm"></div>
              <div className="h-40 w-3/4 bg-kod-bg border border-kod-border/30 rounded-sm"></div>
            </div>
          </Card>
        </div>
        <SecondaryPanel 
          title="Compliance" 
          description="Submit proof of work here to satisfy build requirements."
        />
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentRoute) {
      case '/': return <LandingPage />;
      case '/dashboard': return <DashboardPage />;
      case '/settings': return <SettingsPage />;
      case '/saved': return <EmptyStatePage title="Saved" desc="Your bookmarked job listings." />;
      case '/digest': return <EmptyStatePage title="Digest" desc="Daily summary archives." />;
      case '/proof': return <ProofPage />;
      default: return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-kod-bg selection:bg-kod-accent selection:text-white pb-[140px] transition-premium">
      <TopBar 
        projectName="KodNest Premium"
        currentRoute={currentRoute}
        onNavigate={navigate}
        status={proofItems.every(p => p.completed) ? ProjectStatus.SHIPPED : ProjectStatus.IN_PROGRESS}
      />

      <main className="max-w-[1400px] mx-auto px-24 pt-24">
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