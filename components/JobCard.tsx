import React from 'react';
import { Job, JobStatus } from '../types';
import { Card, Button, Badge } from './Common';

interface JobCardProps {
  job: Job;
  status: JobStatus;
  onView: (job: Job) => void;
  onSave: (job: Job) => void;
  onStatusChange: (jobId: string, status: JobStatus) => void;
  isSaved: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, status, onView, onSave, onStatusChange, isSaved }) => {
  const getRelativeTime = (days: number) => {
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-kod-success/10 text-kod-success border-kod-success/30';
    if (score >= 60) return 'bg-kod-warning/10 text-kod-warning border-kod-warning/30';
    if (score >= 40) return 'bg-kod-primary/5 text-kod-primary border-kod-border';
    return 'bg-kod-primary/[0.02] text-kod-primary/40 border-kod-border/30';
  };

  const getStatusBadgeStyles = (s: JobStatus) => {
    switch (s) {
      case 'Applied': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'Selected': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-kod-bg text-kod-primary border-kod-border opacity-50';
    }
  };

  return (
    <Card className="flex flex-col h-full hover:border-kod-primary transition-premium group relative">
      <div className="absolute top-16 right-16 flex flex-col items-end gap-8">
        <Badge>{job.source}</Badge>
        {job.matchScore !== undefined && (
          <div className={`px-8 py-4 text-[10px] font-bold border ${getScoreColor(job.matchScore)} transition-colors duration-200`}>
            {job.matchScore}% MATCH
          </div>
        )}
      </div>

      <div className="mb-16">
        <div className={`inline-block px-8 py-2 text-[9px] font-bold uppercase tracking-widest border mb-8 ${getStatusBadgeStyles(status)}`}>
          {status}
        </div>
        <h3 className="text-lg font-semibold text-kod-primary group-hover:text-kod-accent transition-colors duration-200 leading-snug pr-64">
          {job.title}
        </h3>
        <p className="text-sm font-medium opacity-60">{job.company}</p>
      </div>

      <div className="flex flex-col gap-8 mb-24 flex-grow">
        <div className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-wider text-kod-primary/50">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {job.location} • {job.mode}
        </div>
        <div className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-wider text-kod-primary/50">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {job.experience} Experience
        </div>
        <div className="mt-8 text-[12px] font-bold text-kod-accent bg-kod-accent/5 px-8 py-4 self-start">
          {job.salaryRange}
        </div>
      </div>

      <div className="mt-auto pt-20 border-t border-kod-border/30">
        <div className="flex flex-wrap gap-4 mb-16">
          {(['Not Applied', 'Applied', 'Rejected', 'Selected'] as JobStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(job.id, s)}
              className={`text-[9px] font-bold uppercase tracking-widest px-8 py-4 border transition-all duration-200 ${
                status === s 
                  ? 'bg-kod-primary text-white border-kod-primary' 
                  : 'bg-transparent text-kod-primary opacity-40 hover:opacity-100 border-kod-border'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-8 mb-12">
          <Button variant="secondary" className="flex-1 py-8 text-[11px] uppercase tracking-wider h-auto" onClick={() => onView(job)}>
            View
          </Button>
          <Button 
            variant={isSaved ? 'success' : 'secondary'} 
            className="flex-1 py-8 text-[11px] uppercase tracking-wider h-auto" 
            onClick={() => onSave(job)}
          >
            {isSaved ? 'Saved' : 'Save'}
          </Button>
        </div>
        <Button variant="primary" className="w-full py-10 text-[11px] uppercase tracking-wider h-auto" onClick={() => window.open(job.applyUrl, '_blank')}>
          Apply
        </Button>
      </div>

      <div className="mt-12 flex justify-end">
        <span className="text-[10px] opacity-40 uppercase tracking-widest font-bold">
          {getRelativeTime(job.postedDaysAgo)}
        </span>
      </div>
    </Card>
  );
};

export default JobCard;
