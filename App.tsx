
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ProjectStatus, ProofItem, Job, UserPreferences, JobMode, JobExperience, JobStatus, StatusRecord } from './types';
import { INITIAL_PROOF_CHECKLIST, JOBS_DATA } from './constants';
import TopBar from './components/TopBar';
import ContextHeader from './components/ContextHeader';
import ProofFooter from './components/ProofFooter';
import SecondaryPanel from './components/SecondaryPanel';
import JobCard from './components/JobCard';
import JobModal from './components/JobModal';
import { Card, Button, Input, Badge } from './components/Common';

const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.error('LocalStorage access denied', e);
    return null;
  }
};

const safeSetItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.error('LocalStorage write denied', e);
  }
};

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    try {
      return window.location.pathname === '/' ? '/' : window.location.pathname;
    } catch {
      return '/';
    }
  });

  const [proofItems, setProofItems] = useState<ProofItem[]>(INITIAL_PROOF_CHECKLIST);
  
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    const saved = safeGetItem('kodnest_saved_jobs');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [jobStatuses, setJobStatuses] = useState<Record<string, StatusRecord>>(() => {
    const saved = safeGetItem('jobTrackerStatus');
    if (!saved) return {};
    try {
      return JSON.parse(saved);
    } catch {
      return {};
    }
  });

  const [preferences, setPreferences] = useState<UserPreferences | null>(() => {
    const saved = safeGetItem('jobTrackerPreferences');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const [todayDigest, setTodayDigest] = useState<Job[] | null>(() => {
    const saved = safeGetItem(`jobTrackerDigest_${todayStr}`);
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  });

  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  };

  // UI state for Dashboard
  const [search, setSearch] = useState('');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterMode, setFilterMode] = useState('All');
  const [filterExp, setFilterExp] = useState('All');
  const [filterSource, setFilterSource] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');
  const [showMatchesOnly, setShowMatchesOnly] = useState(false);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      try {
        setCurrentRoute(window.location.pathname);
      } catch {
        setCurrentRoute('/');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    safeSetItem('kodnest_saved_jobs', JSON.stringify(savedJobIds));
  }, [savedJobIds]);

  useEffect(() => {
    safeSetItem('jobTrackerStatus', JSON.stringify(jobStatuses));
  }, [jobStatuses]);

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
    try {
      window.history.pushState({}, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.warn('Navigation state update failed', e);
    }
  };

  const handleSaveJob = (job: Job) => {
    setSavedJobIds(prev => 
      prev.includes(job.id) ? prev.filter(id => id !== job.id) : [...prev, job.id]
    );
  };

  const handleStatusChange = (jobId: string, status: JobStatus) => {
    setJobStatuses(prev => ({
      ...prev,
      [jobId]: { status, timestamp: new Date().toISOString() }
    }));
    showToast(`Status updated: ${status}`);
  };

  const handleSavePreferences = (prefs: UserPreferences) => {
    setPreferences(prefs);
    safeSetItem('jobTrackerPreferences', JSON.stringify(prefs));
  };

  // --- Match Score Engine ---
  const calculateMatchScore = (job: Job, prefs: UserPreferences): number => {
    let score = 0;
    const roleKeywords = prefs.roleKeywords || [];
    const skills = prefs.skills || [];
    const preferredLocations = prefs.preferredLocations || [];
    const preferredMode = prefs.preferredMode || [];

    if (roleKeywords.some(kw => job.title.toLowerCase().includes(kw.toLowerCase()))) score += 25;
    if (roleKeywords.some(kw => job.description.toLowerCase().includes(kw.toLowerCase()))) score += 15;
    if (preferredLocations.some(loc => job.location === loc)) score += 15;
    if (preferredMode.includes(job.mode)) score += 10;
    if (job.experience === prefs.experienceLevel) score += 10;
    if (skills.some(skill => job.skills.some(js => js.toLowerCase() === skill.toLowerCase()))) score += 15;
    if (job.postedDaysAgo <= 2) score += 5;
    if (job.source === 'LinkedIn') score += 5;
    return Math.min(score, 100);
  };

  const processedJobs = useMemo(() => {
    return JOBS_DATA.map(job => ({
      ...job,
      matchScore: preferences ? calculateMatchScore(job, preferences) : undefined
    }));
  }, [preferences]);

  // --- Digest Generation ---
  const generateDigest = () => {
    if (!preferences) return;
    const sorted = [...processedJobs].sort((a, b) => {
      const scoreDiff = (b.matchScore || 0) - (a.matchScore || 0);
      if (scoreDiff !== 0) return scoreDiff;
      return a.postedDaysAgo - b.postedDaysAgo;
    });
    const top10 = sorted.slice(0, 10);
    setTodayDigest(top10);
    safeSetItem(`jobTrackerDigest_${todayStr}`, JSON.stringify(top10));
  };

  const copyDigestToClipboard = async () => {
    if (!todayDigest) return;
    const text = todayDigest.map((j, i) => 
      `${i + 1}. ${j.title} at ${j.company} (${j.matchScore}% match)\n   Location: ${j.location}\n   Apply: ${j.applyUrl}`
    ).join('\n\n');
    try {
      await navigator.clipboard.writeText(`My 9AM Job Digest - ${todayStr}\n\n${text}`);
    } catch (err) {
      console.error('Failed to copy digest', err);
    }
  };

  const createEmailDraft = () => {
    if (!todayDigest) return;
    const subject = encodeURIComponent(`My 9AM Job Digest - ${todayStr}`);
    const text = todayDigest.map((j, i) => 
      `${i + 1}. ${j.title} at ${j.company} (${j.matchScore}% match)%0D%0A   Location: ${j.location}%0D%0A   Apply: ${j.applyUrl}`
    ).join('%0D%0A%0D%0A');
    window.location.href = `mailto:?subject=${subject}&body=${text}`;
  };

  const filteredJobs = useMemo(() => {
    let result = processedJobs.filter(job => {
      const matchSearch = job.title.toLowerCase().includes(search.toLowerCase()) || 
                          job.company.toLowerCase().includes(search.toLowerCase());
      const matchLoc = filterLocation === 'All' || job.location === filterLocation;
      const matchMode = filterMode === 'All' || job.mode === filterMode;
      const matchExp = filterExp === 'All' || job.experience === filterExp;
      const matchSrc = filterSource === 'All' || job.source === filterSource;
      const currentStatus = jobStatuses[job.id]?.status || 'Not Applied';
      const matchStatus = filterStatus === 'All' || currentStatus === filterStatus;
      const matchThreshold = !showMatchesOnly || (job.matchScore !== undefined && job.matchScore >= (preferences?.minMatchScore || 0));
      
      return matchSearch && matchLoc && matchMode && matchExp && matchSrc && matchStatus && matchThreshold;
    });
    if (sortBy === 'Latest') result.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
    else if (sortBy === 'Oldest') result.sort((a, b) => b.postedDaysAgo - a.postedDaysAgo);
    else if (sortBy === 'Score') result.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    else if (sortBy === 'Salary') {
      const getMinSalary = (range: string) => {
        const matches = range.match(/\d+/);
        return matches ? parseInt(matches[0]) : 0;
      };
      result.sort((a, b) => getMinSalary(b.salaryRange) - getMinSalary(a.salaryRange));
    }
    return result;
  }, [processedJobs, search, filterLocation, filterMode, filterExp, filterSource, filterStatus, sortBy, showMatchesOnly, preferences, jobStatuses]);

  const savedJobsList = useMemo(() => {
    return processedJobs.filter(j => savedJobIds.includes(j.id));
  }, [processedJobs, savedJobIds]);

  const recentStatusUpdates = useMemo(() => {
    return Object.entries(jobStatuses)
      .map(([jobId, record]) => {
        const job = JOBS_DATA.find(j => j.id === jobId);
        // Fix for "Spread types may only be created from object types" error
        // Using Object.assign to merge properties to avoid spread operator limitations with certain TypeScript types/versions
        return job ? Object.assign({}, job, record) as (Job & StatusRecord) : null;
      })
      // Added safety check for null and ensuring the status property exists before access
      .filter((x): x is (Job & StatusRecord) => !!x && x.status !== 'Not Applied')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [jobStatuses]);

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

  const FilterBar = () => {
    const locations = ['All', ...Array.from(new Set(JOBS_DATA.map(j => j.location))).sort()];
    const modes = ['All', 'Remote', 'Hybrid', 'Onsite'];
    const exps = ['All', 'Fresher', '0-1', '1-3', '3-5'];
    const sources = ['All', 'LinkedIn', 'Naukri', 'Indeed'];
    const statuses = ['All', 'Not Applied', 'Applied', 'Rejected', 'Selected'];
    return (
      <Card className="mb-40 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-12 p-16 sticky top-[64px] z-30 shadow-sm border-t-0 bg-white/95 backdrop-blur-md">
        <div className="lg:col-span-1">
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="py-10 text-xs" />
        </div>
        <select className="bg-kod-bg border border-kod-border px-8 py-10 text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:border-kod-primary" value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}>
          {locations.map(l => <option key={l} value={l}>{l === 'All' ? 'Location: All' : l}</option>)}
        </select>
        <select className="bg-kod-bg border border-kod-border px-8 py-10 text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:border-kod-primary" value={filterMode} onChange={(e) => setFilterMode(e.target.value)}>
          {modes.map(m => <option key={m} value={m}>{m === 'All' ? 'Mode: All' : m}</option>)}
        </select>
        <select className="bg-kod-bg border border-kod-border px-8 py-10 text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:border-kod-primary" value={filterExp} onChange={(e) => setFilterExp(e.target.value)}>
          {exps.map(e => <option key={e} value={e}>{e === 'All' ? 'Exp: All' : e}</option>)}
        </select>
        <select className="bg-kod-bg border border-kod-border px-8 py-10 text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:border-kod-primary" value={filterSource} onChange={(e) => setFilterSource(e.target.value)}>
          {sources.map(s => <option key={s} value={s}>{s === 'All' ? 'Source: All' : s}</option>)}
        </select>
        <select className="bg-kod-bg border border-kod-border px-8 py-10 text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:border-kod-primary" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'Status: All' : s}</option>)}
        </select>
        <select className="bg-kod-bg border border-kod-border px-8 py-10 text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:border-kod-primary" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="Latest">Latest</option>
          <option value="Oldest">Oldest</option>
          <option value="Score">Match Score</option>
          <option value="Salary">Salary (High)</option>
        </select>
      </Card>
    );
  };

  const DashboardPage = () => (
    <div className="flex flex-col gap-24">
      {!preferences && (
        <Card className="bg-kod-accent/5 border-kod-accent/20 mb-16 flex items-center justify-between p-16">
          <p className="text-sm font-medium text-kod-accent">Set your preferences to activate intelligent matching.</p>
          <Button variant="primary" onClick={() => navigate('/settings')} className="py-8 px-16 text-xs uppercase tracking-wider">Setup Now</Button>
        </Card>
      )}
      <ContextHeader title="Active Discoveries" subtitle="Precision curated listings from top-tier companies, updated daily." />
      <FilterBar />
      <div className="flex flex-col md:flex-row gap-40">
        <div className="w-full md:w-[70%]">
          {preferences && (
            <div className="flex items-center gap-12 mb-24 pb-24 border-b border-kod-border/30">
              <button onClick={() => setShowMatchesOnly(!showMatchesOnly)} className={`w-40 h-20 rounded-full transition-colors relative ${showMatchesOnly ? 'bg-kod-accent' : 'bg-kod-border'}`}>
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
                  status={jobStatuses[job.id]?.status || 'Not Applied'}
                  onView={setSelectedJob} 
                  onSave={handleSaveJob} 
                  onStatusChange={handleStatusChange}
                  isSaved={savedJobIds.includes(job.id)} 
                />
              ))}
            </div>
          ) : (
            <Card className="min-h-[400px] flex flex-col items-center justify-center border-dashed border-2 bg-white/40">
              <div className="text-center px-24 max-w-md">
                <h3 className="text-2xl serif-heading mb-12 text-kod-primary">No matching jobs.</h3>
                <p className="text-sm text-kod-primary opacity-50 leading-relaxed">No roles match your criteria. Adjust filters or lower threshold in Settings.</p>
              </div>
            </Card>
          )}
        </div>
        <SecondaryPanel title="Market Trends" description="We are currently seeing a 15% uptick in hybrid roles across Bangalore and Hyderabad tech clusters." />
      </div>
    </div>
  );

  const DigestPage = () => (
    <div className="flex flex-col gap-24">
      <ContextHeader title="Daily Digest" subtitle="Your personalized 9:00 AM briefing for high-potential matches." />
      
      {!preferences ? (
        <Card className="flex flex-col items-center justify-center p-64 text-center">
          <h3 className="text-xl serif-heading mb-16">Preferences Required</h3>
          <p className="text-sm opacity-60 max-w-sm mb-32">Set your preferences to generate a personalized digest of the best opportunities for you.</p>
          <Button variant="primary" onClick={() => navigate('/settings')}>Calibrate Search</Button>
        </Card>
      ) : !todayDigest ? (
        <Card className="flex flex-col items-center justify-center p-64 text-center">
          <div className="w-64 h-64 bg-kod-bg rounded-full flex items-center justify-center mb-24 opacity-50">
            <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 className="text-xl serif-heading mb-16">Digest Ready for {todayStr}</h3>
          <p className="text-sm opacity-60 max-w-sm mb-32">Our engine has identified several roles matching your core profile.</p>
          <Button variant="primary" onClick={generateDigest}>Generate Today's 9AM Digest (Simulated)</Button>
          <p className="mt-16 text-[10px] opacity-40 uppercase tracking-widest font-bold">Demo Mode: Daily 9AM trigger simulated manually.</p>
        </Card>
      ) : (
        <div className="flex flex-col md:flex-row gap-40">
          <div className="w-full md:w-[70%] flex flex-col gap-24">
            <Card className="bg-white p-0 overflow-hidden shadow-sm">
              <div className="bg-kod-bg p-40 border-b border-kod-border">
                <h2 className="text-2xl serif-heading mb-8">Top 10 Jobs For You — 9AM Digest</h2>
                <p className="text-sm opacity-60 font-medium">Prepared for {todayStr}</p>
                <div className="flex gap-12 mt-24">
                  <Button variant="secondary" onClick={copyDigestToClipboard} className="text-[11px] py-8 px-16 uppercase tracking-wider h-auto">Copy Digest to Clipboard</Button>
                  <Button variant="secondary" onClick={createEmailDraft} className="text-[11px] py-8 px-16 uppercase tracking-wider h-auto">Create Email Draft</Button>
                </div>
              </div>
              <div className="p-40 space-y-40">
                {todayDigest.map((job, idx) => (
                  <div key={job.id} className="flex flex-col md:flex-row md:items-center justify-between gap-24 pb-40 border-b border-kod-border last:border-0 last:pb-0">
                    <div>
                      <div className="flex items-center gap-12 mb-8">
                        <span className="text-[10px] font-bold opacity-30">#{idx + 1}</span>
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <div className="px-8 py-2 bg-kod-success/10 text-kod-success text-[10px] font-bold border border-kod-success/30">{job.matchScore}% MATCH</div>
                      </div>
                      <p className="text-sm font-medium opacity-60 mb-8">{job.company} • {job.location}</p>
                      <p className="text-xs opacity-50">{job.experience} Experience • {job.mode}</p>
                    </div>
                    <Button variant="primary" onClick={() => window.open(job.applyUrl, '_blank')} className="py-10 px-24 text-[11px] uppercase tracking-wider h-auto self-start md:self-center">Apply Now</Button>
                  </div>
                ))}
              </div>
              <div className="bg-kod-bg/50 p-24 text-center border-t border-kod-border">
                <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">This digest was generated based on your preferences.</p>
              </div>
            </Card>

            <Card className="p-40">
              <h3 className="text-xl serif-heading mb-24">Recent Status Updates</h3>
              {recentStatusUpdates.length > 0 ? (
                <div className="space-y-16">
                  {recentStatusUpdates.slice(0, 5).map(record => (
                    <div key={record.id} className="flex justify-between items-center py-12 border-b border-kod-border last:border-0">
                      <div>
                        <h4 className="text-sm font-semibold">{record.title}</h4>
                        <p className="text-xs opacity-50">{record.company} • {new Date(record.timestamp).toLocaleDateString()}</p>
                      </div>
                      <div className={`px-8 py-4 text-[9px] font-bold uppercase tracking-widest border ${
                        record.status === 'Applied' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                        record.status === 'Rejected' ? 'bg-red-50 border-red-200 text-red-800' :
                        'bg-green-50 border-green-200 text-green-800'
                      }`}>
                        {record.status}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm opacity-40 italic">No status updates logged yet.</p>
              )}
            </Card>
          </div>
          <SecondaryPanel title="Digest Logic" description="We prioritize jobs with the highest match score posted within the last 48 hours. Recent status changes are logged for your personal audit trail." />
        </div>
      )}
    </div>
  );

  const SavedPage = () => (
    <div className="flex flex-col gap-24">
      <ContextHeader title="Saved Jobs" subtitle="Opportunities you've earmarked for serious consideration." />
      <div className="flex flex-col md:flex-row gap-40">
        <div className="w-full md:w-[70%]">
          {savedJobsList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-24">
              {savedJobsList.map(job => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  status={jobStatuses[job.id]?.status || 'Not Applied'}
                  onView={setSelectedJob} 
                  onSave={handleSaveJob} 
                  onStatusChange={handleStatusChange}
                  isSaved={true} 
                />
              ))}
            </div>
          ) : (
            <Card className="min-h-[440px] flex flex-col items-center justify-center border-dashed border-2 bg-white/40">
              <div className="text-center px-24 max-w-sm">
                <h3 className="text-2xl serif-heading mb-12 text-kod-primary">No saved items.</h3>
                <p className="text-sm text-kod-primary opacity-50 leading-relaxed">Start bookmarking interesting job discoveries to see them listed here for quick access.</p>
              </div>
            </Card>
          )}
        </div>
        <SecondaryPanel title="Collection Info" description="Items here are stored locally in your browser." />
      </div>
    </div>
  );

  const SettingsPage = () => {
    const modesArr: JobMode[] = ['Remote', 'Hybrid', 'Onsite'];
    const [formPrefs, setFormPrefs] = useState<UserPreferences>(() => preferences || {
      roleKeywords: [], preferredLocations: [], preferredMode: ['Remote'], experienceLevel: '0-1', skills: [], minMatchScore: 40
    });

    const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormPrefs(prev => ({ ...prev, roleKeywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }));
    };

    const handleLocationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormPrefs(prev => ({ ...prev, preferredLocations: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }));
    };

    const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormPrefs(prev => ({ ...prev, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }));
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
        <ContextHeader title="Settings" subtitle="Define your preferences to calibrate the intelligent matching engine." />
        <div className="flex flex-col md:flex-row gap-40">
          <div className="w-full md:w-[70%]">
            <Card className="space-y-48 p-40">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-40 gap-y-32">
                <div className="space-y-8">
                  <label className="text-[11px] font-bold uppercase tracking-widest opacity-60">Role keywords</label>
                  <Input 
                    placeholder="e.g. Frontend, Engineer, React" 
                    value={formPrefs.roleKeywords.join(', ')} 
                    onChange={handleKeywordsChange} 
                  />
                </div>
                <div className="space-y-8">
                  <label className="text-[11px] font-bold uppercase tracking-widest opacity-60">Preferred locations</label>
                  <Input 
                    placeholder="e.g. Bangalore, Hyderabad" 
                    value={formPrefs.preferredLocations.join(', ')} 
                    onChange={handleLocationsChange} 
                  />
                </div>
                <div className="space-y-16">
                  <label className="text-[11px] font-bold uppercase tracking-widest opacity-60">Preferred Mode</label>
                  <div className="flex flex-wrap gap-12">
                    {modesArr.map(m => (
                      <label key={m} className="flex items-center gap-8 cursor-pointer">
                        <input type="checkbox" checked={formPrefs.preferredMode.includes(m)} onChange={() => toggleMode(m)} className="accent-kod-accent" />
                        <span className="text-xs font-medium">{m}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-8">
                  <label className="text-[11px] font-bold uppercase tracking-widest opacity-60">Experience level</label>
                  <select className="w-full bg-kod-bg border border-kod-border px-16 py-14 focus:border-kod-primary focus:outline-none appearance-none text-sm" value={formPrefs.experienceLevel} onChange={(e) => setFormPrefs(prev => ({ ...prev, experienceLevel: e.target.value as JobExperience }))}>
                    <option value="Fresher">Fresher</option>
                    <option value="0-1">0-1 Year</option>
                    <option value="1-3">1-3 Years</option>
                    <option value="3-5">3-5 Years</option>
                  </select>
                </div>
                <div className="space-y-8 md:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest opacity-60">Skills</label>
                  <Input 
                    placeholder="e.g. React, Node.js" 
                    value={formPrefs.skills.join(', ')} 
                    onChange={handleSkillsChange} 
                  />
                </div>
                <div className="space-y-16 md:col-span-2">
                  <div className="flex justify-between items-center"><label className="text-[11px] font-bold uppercase tracking-widest opacity-60">Min Match Score Threshold</label><span className="text-sm font-bold text-kod-accent">{formPrefs.minMatchScore}%</span></div>
                  <input type="range" min="0" max="100" step="5" className="w-full accent-kod-accent" value={formPrefs.minMatchScore} onChange={(e) => setFormPrefs(prev => ({ ...prev, minMatchScore: parseInt(e.target.value) }))} />
                </div>
              </div>
              <div className="pt-32 border-t border-kod-border flex justify-end">
                <Button variant="primary" className="px-40" onClick={() => { handleSavePreferences(formPrefs); navigate('/dashboard'); }}>Save Preferences</Button>
              </div>
            </Card>
          </div>
          <SecondaryPanel title="Matching Logic" description="Our engine weights role keywords (+40%), skills (+15%), location (+15%), and mode (+10%) to determine relevance." />
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentRoute) {
      case '/': return <LandingPage />;
      case '/dashboard': return <DashboardPage />;
      case '/settings': return <SettingsPage />;
      case '/saved': return <SavedPage />;
      case '/digest': return <DigestPage />;
      case '/proof': return (
        <div className="flex flex-col gap-40">
          <ContextHeader title="Proof" subtitle="Artifact collection for development validation." />
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
            <SecondaryPanel title="Compliance" description="Submit proof of work here to satisfy build requirements." />
          </div>
        </div>
      );
      default: return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-kod-bg selection:bg-kod-accent selection:text-white pb-[140px] transition-premium">
      <TopBar projectName="Job Tracker" currentRoute={currentRoute} onNavigate={navigate} status={proofItems.every(p => p.completed) ? ProjectStatus.SHIPPED : ProjectStatus.IN_PROGRESS} />
      
      <main className="max-w-[1400px] mx-auto px-24 pt-24">{renderContent()}</main>

      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed top-80 right-24 bg-kod-primary text-white px-24 py-12 text-xs font-bold uppercase tracking-widest z-[100] shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          {toast.message}
        </div>
      )}

      <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      <ProofFooter items={proofItems} onToggle={handleToggleProof} onProofChange={handleProofChange} />
    </div>
  );
};

export default App;
