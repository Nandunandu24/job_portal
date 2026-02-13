import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ProjectStatus, ProofItem, Job, UserPreferences, JobMode, JobExperience } from './types';
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

  const [preferences, setPreferences] = useState<UserPreferences | null>(() => {
    const saved = localStorage.getItem('jobTrackerPreferences');
    return saved ? JSON.parse(saved) : null;
  });

  // UI state for Dashboard
  const [search, setSearch] = useState('');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterMode, setFilterMode] = useState('All');
  const [filterExp, setFilterExp] = useState('All');
  const [filterSource, setFilterSource] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');
  const [showMatchesOnly, setShowMatchesOnly] = useState(false);

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

  const handleSavePreferences = (prefs: UserPreferences) => {
    setPreferences(prefs);
    localStorage.setItem('jobTrackerPreferences', JSON.stringify(prefs));
  };

  // --- Match Score Engine ---
  const calculateMatchScore = (job: Job, prefs: UserPreferences): number => {
    let score = 0;

    // +25 if any roleKeyword appears in job.title (case-insensitive)
    if (prefs.roleKeywords.some(kw => job.title.toLowerCase().includes(kw.toLowerCase()))) {
      score += 25;
    }

    // +15 if any roleKeyword appears in job.description
    if (prefs.roleKeywords.some(kw => job.description.toLowerCase().includes(kw.toLowerCase()))) {
      score += 15;
    }

    // +15 if job.location matches preferredLocations
    if (prefs.preferredLocations.some(loc => job.location === loc)) {
      score += 15;
    }

    // +10 if job.mode matches preferredMode
    if (prefs.preferredMode.includes(job.mode)) {
      score += 10;
    }

    // +10 if job.experience matches experienceLevel
    if (job.experience === prefs.experienceLevel) {
      score += 10;
    }

    // +15 if overlap between job.skills and user.skills (any match)
    if (prefs.skills.some(skill => job.skills.some(js => js.toLowerCase() === skill.toLowerCase()))) {
      score += 15;
    }

    // +5 if postedDaysAgo <= 2
    if (job.postedDaysAgo <= 2) {
      score += 5;
    }

    // +5 if source is LinkedIn
    if (job.source === 'LinkedIn') {
      score += 5;
    }

    return Math.min(score, 100);
  };

  // --- Filtering Logic ---
  const locations = useMemo(() => ['All', ...Array.from(new Set(JOBS_DATA.map(j => j.location))).sort()], []);
  const modes = ['All', 'Remote', 'Hybrid', 'Onsite'];
  const exps = ['All', 'Fresher', '0-1', '1-3', '3-5'];
  const sources = ['All', 'LinkedIn', 'Naukri', 'Indeed'];

  const processedJobs = useMemo(() => {
    return JOBS_DATA.map(job => ({
      ...job,
      matchScore: preferences ? calculateMatchScore(job, preferences) : undefined
    }));
  }, [preferences]);

  const filteredJobs = useMemo(() => {
    let result = processedJobs.filter(job => {
      const matchSearch = job.title.toLowerCase().includes(search.toLowerCase()) || 
                          job.company.toLowerCase().includes(search.toLowerCase());
      const matchLoc = filterLocation === 'All' || job.location === filterLocation;
      const matchMode = filterMode === 'All' || job.mode === filterMode;
      const matchExp = filterExp === 'All' || job.experience === filterExp;
      const matchSrc = filterSource === 'All' || job.source === filterSource;
      const matchThreshold = !showMatchesOnly || (job.matchScore !== undefined && job.matchScore >= (preferences?.minMatchScore || 0));
      
      return matchSearch && matchLoc && matchMode && matchExp && matchSrc && matchThreshold;
    });

    if (sortBy === 'Latest') {
      result.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
    } else if (sortBy === 'Oldest') {
      result.sort((a, b) => b.postedDaysAgo - a.postedDaysAgo);
    } else if (sortBy === 'Score') {
      result.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else if (sortBy === 'Salary') {
      // Basic numeric extract sort (e.g. "10-18 LPA" -> 10)
      const getMinSalary = (range: string) => {
        const matches = range.match(/\d+/);
        return matches ? parseInt(matches[0]) : 0;
      };
      result.sort((a, b) => getMinSalary(b.salaryRange) - getMinSalary(a.salaryRange));
    }
    
    return result;
  }, [processedJobs, search, filterLocation, filterMode, filterExp, filterSource, sortBy, showMatchesOnly, preferences]);

  const savedJobsList = useMemo(() => {
    return processedJobs.filter(j => savedJobIds.includes(j.id));
  }, [processedJobs, savedJobIds]);

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
    <Card className="mb-40 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-12 p-16 sticky top-[64px] z-30 shadow-sm border-t-0 bg-white/95 backdrop-blur-md">
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
        <option value="Latest">Latest</option>
        <option value="Oldest">Oldest</option>
        <option value="Score">Match Score</option>
        <option value="Salary">Salary (High)</option>
      </select>
    </Card>
  );

  const DashboardPage = () => (
    <div className="flex flex-col gap-24">
      {!preferences && (
        <Card className="bg-kod-accent/5 border-kod-accent/20 mb-16 flex items-center justify-between p-16">
          <p className="text-sm font-medium text-kod-accent">Set your preferences to activate intelligent matching.</p>
          <Button variant="primary" onClick={() => navigate('/settings')} className="py-8 px-16 text-xs uppercase tracking-wider">Setup Now</Button>
        </Card>
      )}

      <ContextHeader 
        title="Active Discoveries" 
        subtitle="Precision curated listings from top-tier companies, updated daily." 
      />

      <div className="flex items-center justify-between mb-16">
        <FilterBar />
      </div>

      <div className="flex flex-col md:flex-row gap-40">
        <div className="w-full md:w-[70%]">
          {preferences && (
            <div className="flex items-center gap-12 mb-24 pb-24 border-b border-kod-border/30">
              <button 
                onClick={() => setShowMatchesOnly(!showMatchesOnly)}
                className={`w-40 h-20 rounded-full transition-colors relative ${showMatchesOnly ? 'bg-kod-accent' : 'bg-kod-border'}`}
              >
                <div className={`absolute top-2 w-16 h-16 bg-white rounded-full transition-all ${showMatchesOnly ? 'left-[22px]' : 'left-2'}`} />
              </button>
              <span className="text-xs font-bold uppercase tracking-widest opacity-60">Show only jobs above my threshold ({preferences.minMatchScore}%)</span>
            </div>
          )}

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
                  No roles match your criteria. Adjust filters or lower your matching threshold in Settings.
                </p>
                <Button variant="secondary" onClick={() => {
                  setSearch('');
                  setFilterLocation('All');
                  setFilterMode('All');
                  setFilterExp('All');
                  setFilterSource('All');
                  setShowMatchesOnly(false);
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

  const SettingsPage = () => {
    const [formPrefs, setFormPrefs] = useState<UserPreferences>(() => preferences || {
      roleKeywords: [],
      preferredLocations: [],
      preferredMode: ['Remote'],
      experienceLevel: '0-1',
      skills: [],
      minMatchScore: 40
    });

    const handleTextChange = (field: 'roleKeywords' | 'skills' | 'preferredLocations', value: string) => {
      setFormPrefs(prev => ({
        ...prev,
        [field]: value.split(',').map(s => s.trim()).filter(Boolean)
      }));
    };

    const toggleMode = (mode: JobMode) => {
      setFormPrefs(prev => ({
        ...prev,
        preferredMode: prev.preferredMode.includes(mode) 
          ? prev.preferredMode.filter(m => m !== mode) 
          : [...prev.preferredMode, mode]
      }));
    };

    return (
      <div className="flex flex-col gap-40">
        <ContextHeader 
          title="Settings" 
          subtitle="Define your preferences to calibrate the intelligent matching engine." 
        />
        <div className="flex flex-col md:flex-row gap-40">
          <div className="w-full md:w-[70%]">
            <Card className="space-y-48 p-40">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-40 gap-y-32">
                <div className="space-y-8">
                  <label className="text-[11px] font-bold uppercase tracking-widest opacity-60">Role keywords</label>
                  <Input 
                    placeholder="e.g. Frontend, Engineer, React" 
                    defaultValue={formPrefs.roleKeywords.join(', ')}
                    onBlur={(e) => handleTextChange('roleKeywords', e.target.value)}
                  />
                  <p className="text-[10px] opacity-40 italic">Separated by commas.</p>
                </div>
                <div className="space-y-8">
                  <label className="text-[11px] font-bold uppercase tracking-widest opacity-60">Preferred locations</label>
                  <Input 
                    placeholder="e.g. Bangalore, Hyderabad" 
                    defaultValue={formPrefs.preferredLocations.join(', ')}
                    onBlur={(e) => handleTextChange('preferredLocations', e.target.value)}
                  />
                  <p className="text-[10px] opacity-40 italic">Separated by commas.</p>
                </div>
                <div className="space-y-16">
                  <label className="text-[11px] font-bold uppercase tracking-widest opacity-60">Preferred Mode</label>
                  <div className="flex flex-wrap gap-12">
                    {modes.filter(m => m !== 'All').map(m => (
                      <label key={m} className="flex items-center gap-8 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formPrefs.preferredMode.includes(m as JobMode)} 
                          onChange={() => toggleMode(m as JobMode)}
                          className="accent-kod-accent"
                        />
                        <span className="text-xs font-medium">{m}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-8">
                  <label className="text-[11px] font-bold uppercase tracking-widest opacity-60">Experience level</label>
                  <select 
                    className="w-full bg-kod-bg border border-kod-border px-16 py-14 focus:border-kod-primary focus:outline-none transition-premium appearance-none text-sm"
                    value={formPrefs.experienceLevel}
                    onChange={(e) => setFormPrefs(prev => ({ ...prev, experienceLevel: e.target.value as JobExperience }))}
                  >
                    <option value="Fresher">Fresher</option>
                    <option value="0-1">0-1 Year</option>
                    <option value="1-3">1-3 Years</option>
                    <option value="3-5">3-5 Years</option>
                  </select>
                </div>
                <div className="space-y-8 md:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest opacity-60">Skills</label>
                  <Input 
                    placeholder="e.g. React, Node.js, Python" 
                    defaultValue={formPrefs.skills.join(', ')}
                    onBlur={(e) => handleTextChange('skills', e.target.value)}
                  />
                  <p className="text-[10px] opacity-40 italic">Separated by commas.</p>
                </div>
                <div className="space-y-16 md:col-span-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold uppercase tracking-widest opacity-60">Min Match Score Threshold</label>
                    <span className="text-sm font-bold text-kod-accent">{formPrefs.minMatchScore}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="5"
                    className="w-full accent-kod-accent"
                    value={formPrefs.minMatchScore}
                    onChange={(e) => setFormPrefs(prev => ({ ...prev, minMatchScore: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="pt-32 border-t border-kod-border flex justify-end">
                <Button variant="primary" className="px-40" onClick={() => {
                  handleSavePreferences(formPrefs);
                  navigate('/dashboard');
                }}>Save Preferences</Button>
              </div>
            </Card>
          </div>
          <SecondaryPanel 
            title="Matching Logic" 
            description="Our engine weights role keywords (+40%), skills (+15%), location (+15%), and mode (+10%) to determine relevance."
          />
        </div>
      </div>
    );
  };

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
