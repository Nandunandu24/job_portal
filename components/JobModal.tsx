
import React from 'react';
import { Job } from '../types';
import { Button, Badge } from './Common';

interface JobModalProps {
  job: Job | null;
  onClose: () => void;
}

const JobModal: React.FC<JobModalProps> = ({ job, onClose }) => {
  if (!job) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-24">
      <div 
        className="absolute inset-0 bg-kod-primary/20 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="relative bg-white border border-kod-border max-w-[720px] w-full max-h-[90vh] overflow-y-auto p-40 shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-24 right-24 text-kod-primary opacity-40 hover:opacity-100 transition-opacity"
        >
          <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <header className="mb-40">
          <Badge>{job.source}</Badge>
          <h2 className="serif-heading text-4xl mt-16 mb-8">{job.title}</h2>
          <p className="text-xl text-kod-accent font-medium">{job.company}</p>
          <div className="flex gap-16 mt-16 text-sm opacity-60 font-medium">
            <span>{job.location}</span>
            <span>•</span>
            <span>{job.mode}</span>
            <span>•</span>
            <span>{job.experience} Experience</span>
          </div>
        </header>

        <section className="space-y-32">
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest opacity-40 mb-12">Description</h4>
            <p className="text-lg leading-relaxed text-kod-primary opacity-80 whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest opacity-40 mb-12">Core Skills</h4>
            <div className="flex flex-wrap gap-8">
              {job.skills.map(skill => (
                <span key={skill} className="px-12 py-6 bg-kod-bg text-sm font-medium border border-kod-border">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-32 border-t border-kod-border flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold opacity-40 tracking-widest">Compensation</span>
              <span className="text-lg font-semibold text-kod-accent">{job.salaryRange}</span>
            </div>
            <Button variant="primary" onClick={() => window.open(job.applyUrl, '_blank')} className="px-48">
              Apply Now
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default JobModal;
