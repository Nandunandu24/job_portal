
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ProjectStatus, ProofItem, Job } from './types';
import { INITIAL_PROOF_CHECKLIST, JOBS_DATA } from './constants';
import TopBar from './components/TopBar';
import ContextHeader from './components/ContextHeader';
import ProofFooter from './components/ProofFooter';
import SecondaryPanel from './components/SecondaryPanel';
import JobCard from './components/JobCard';
import JobModal from './components/JobModal';
import { Card, Button, Input, Badge } from './components/Common';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<string>(window.location.pathname === '/' ? '/' : window.location.pathname);
  const [proofItems, setProofItems] = useState<ProofItem[]>(INITIAL_PROOF_CHECKLIST);
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('kodnest_saved_jobs');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Filtering states
  const [search, setSearch] = useState('');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterMode, setFilterMode] = useState('All');
  const [filterExp, setFilterExp] = useState('All');
  const [filterSource, setFilterSource] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    const handlePopState = () => setCurrentRoute(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    localStorage.setItem('kodnest_saved_jobs', JSON.stringify(savedJobIds));
  }, [savedJobIds]);

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

  const handleSaveJob = (job: Job) => {
    setSavedJobIds(prev => 
      prev.includes(job.id) ? prev.filter(id => id !== job.id) : [...prev, job.id]
    );
  };

  // --- Filtering Logic ---
  const locations = useMemo(() => ['All', ...Array.from(new Set(JOBS_DATA.map(j => j.location))).sort()], []);
  const modes = ['All', 'Remote', 'Hybrid', 'Onsite'];
  const exps = ['All', 'Fresher', '0-1', '1-3', '3-5'];
  const sources = ['All', 'LinkedIn', 'Naukri', 'Indeed'];

  const filteredJobs = useMemo(() => {
    let result = JOBS_DATA.filter(job => {
      const matchSearch = job.title.toLowerCase().includes(search.toLowerCase()) || 
                          job.company.toLowerCase().includes(search.toLowerCase());
      const matchLoc = filterLocation === 'All' || job.location === filterLocation;
      const matchMode = filterMode === 'All' || job.mode === filterMode;
      const matchExp = filterExp === 'All' || job.experience === filterExp;
      const matchSrc = filterSource === 'All' || job.source === filterSource;
      return matchSearch && matchLoc && matchMode && matchExp && matchSrc;
    });

    if (sortBy === 'Latest') {
      result.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
    } else if (sortBy === 'Oldest') {
      result.sort((a, b) => b.postedDaysAgo - a.postedDaysAgo);
    }
    
    return result;
  }, [search, filterLocation, filterMode, filterExp, filterSource, sortBy]);

  const savedJobsList = useMemo(() => {
    return JOBS_DATA.filter(j => savedJobIds.includes(j.id));
  }, [savedJobIds]);

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

  const FilterBar = () => (
    <Card className="mb-40 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-12 p-16 sticky top-[64px] z-30 shadow-sm border-t-0 bg-white/95 backdrop-blur-md">
      <div className="lg:col-span-2">
        <Input 
          placeholder="Search role or company..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          className="py-10 text-xs"
        />
      </div>
      <select 
        className="bg-kod-bg border border-kod-border px-8 py-10 text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:border-kod-primary transition-colors cursor-pointer"
        value={filterLocation}
        onChange={(e) => setFilterLocation(e.target.value)}
      >
        {locations.map(l => <option key={l} value={l}>{l === 'All' ? 'Location: All' : l}</option>)}
      </select>
      <select 
        className="bg-kod-bg border border-kod-border px-8 py-10 text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:border-kod-primary transition-colors cursor-pointer"
        value={filterMode}
        onChange={(e) => setFilterMode(e.target.value)}
      >
        {modes.map(m => <option key={m} value={m}>{m === 'All' ? 'Mode: All' : m}</option>)}
      </select>
      <select 
        className="bg-kod-bg border border-kod-border px-8 py-10 text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:border-kod-primary transition-colors cursor-pointer"
        value={filterExp}
        onChange={(e) => setFilterExp(e.target.value)}
      >
        {exps.map(e => <option key={e} value={e}>{e === 'All' ? 'Exp: All' : e}</option>)}
      </select>
      <select 
        className="bg-kod-bg border border-kod-border px-8 py-10 text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:border-kod-primary transition-colors cursor-pointer"
        value={filterSource}
        onChange={(e) => setFilterSource(e.target.value)}
      >
        {sources.map(s => <option key={s} value={s}>{s === 'All' ? 'Source: All' : s}</option>)}
      </select>
      <select 
        className="bg-kod-bg border border-kod-border px-8 py-10 text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:border-kod-primary transition-colors cursor-pointer"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="Latest">Latest First</option>
        <option value="Oldest">Oldest First</option>
      </select>
    </Card>
  );

  const DashboardPage = () => (
    <div className="flex flex-col gap-24">
      <ContextHeader 
        title="Active Discoveries" 
        subtitle="Precision curated listings from top-tier companies, updated daily." 
      />
      <FilterBar />
      <div className="flex flex-col md:flex-row gap-40">
        <div className="w-full md:w-[70%]">
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-24">
              {filteredJobs.map(job => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onView={setSelectedJob} 
                  onSave={handleSaveJob}
                  isSaved={savedJobIds.includes(job.id)}
                />
              ))}
            </div>
          ) : (
            <Card className="min-h-[400px] flex flex-col items-center justify-center border-dashed border-2 bg-white/40">
              <div className="text-center px-24 max-w-md">
                <h3 className="text-2xl serif-heading mb-12 text-kod-primary">No matching jobs.</h3>
                <p className="text-sm text-kod-primary opacity-50 leading-relaxed mb-32">
                  Try adjusting your filters or search terms to see more results.
                </p>
                <Button variant="secondary" onClick={() => {
                  setSearch('');
                  setFilterLocation('All');
                  setFilterMode('All');
                  setFilterExp('All');
                  setFilterSource('All');
                }}>Reset Filters</Button>
              </div>
            </Card>
          )}
        </div>
        <SecondaryPanel 
          title="Market Trends" 
          description="We are currently seeing a 15% uptick in hybrid roles across Bangalore and Hyderabad tech clusters."
        >
          <div className="mt-16 space-y-12">
            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider pb-8 border-b border-kod-border/30">
              <span className="opacity-40">Total Scanned</span>
              <span className="text-kod-primary">{JOBS_DATA.length}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider pb-8 border-b border-kod-border/30">
              <span className="opacity-40">Filtered Matches</span>
              <span className="text-kod-accent">{filteredJobs.length}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider">
              <span className="opacity-40">Saved Items</span>
              <span className="text-kod-primary">{savedJobIds.length}</span>
            </div>
          </div>
        </SecondaryPanel>
      </div>
    </div>
  );

  const SavedPage = () => (
    <div className="flex flex-col gap-24">
      <ContextHeader 
        title="Saved Jobs" 
        subtitle="Opportunities you've earmarked for serious consideration." 
      />
      <div className="flex flex-col md:flex-row gap-40">
        <div className="w-full md:w-[70%]">
          {savedJobsList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-24">
              {savedJobsList.map(job => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onView={setSelectedJob} 
                  onSave={handleSaveJob}
                  isSaved={true}
                />
              ))}
            </div>
          ) : (
            <Card className="min-h-[440px] flex flex-col items-center justify-center border-dashed border-2 bg-white/40">
              <div className="text-center px-24 max-w-sm">
                <h3 className="text-2xl serif-heading mb-12 text-kod-primary">No saved items.</h3>
                <p className="text-sm text-kod-primary opacity-50 leading-relaxed">
                  Start bookmarking interesting job discoveries to see them listed here for quick access.
                </p>
                <Button variant="primary" onClick={() => navigate('/dashboard')} className="mt-24">Explore Jobs</Button>
              </div>
            </Card>
          )}
        </div>
        <SecondaryPanel 
          title="Collection Info" 
          description="Items here are stored locally in your browser. Clearing your cache may remove these bookmarks."
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
      case '/saved': return <SavedPage />;
      case '/digest': return <EmptyStatePage title="Digest" desc="Daily summary archives." />;
      case '/proof': return <ProofPage />;
      default: return <LandingPage />;
    }
  };

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

  return (
    <div className="min-h-screen bg-kod-bg selection:bg-kod-accent selection:text-white pb-[140px] transition-premium">
      <TopBar 
        projectName="Job Tracker"
        currentRoute={currentRoute}
        onNavigate={navigate}
        status={proofItems.every(p => p.completed) ? ProjectStatus.SHIPPED : ProjectStatus.IN_PROGRESS}
      />

      <main className="max-w-[1400px] mx-auto px-24 pt-24">
        {renderContent()}
      </main>

      <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />

      <ProofFooter 
        items={proofItems}
        onToggle={handleToggleProof}
        onProofChange={handleProofChange}
      />
    </div>
  );
};

export default App;
