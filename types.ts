
export enum ProjectStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  SHIPPED = 'Shipped'
}

export interface BuildStep {
  id: number;
  title: string;
  description: string;
  prompt: string;
  isCompleted: boolean;
}

export interface ProofItem {
  id: string;
  label: string;
  completed: boolean;
  proofValue: string;
}

export type JobMode = 'Remote' | 'Hybrid' | 'Onsite';
export type JobExperience = 'Fresher' | '0-1' | '1-3' | '3-5';
export type JobSource = 'LinkedIn' | 'Naukri' | 'Indeed';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  mode: JobMode;
  experience: JobExperience;
  skills: string[];
  source: JobSource;
  postedDaysAgo: number;
  salaryRange: string;
  applyUrl: string;
  description: string;
}
