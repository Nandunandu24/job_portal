
import { ProjectStatus, BuildStep, ProofItem } from './types';

export const SPACING = {
  S: '8px',
  M: '16px',
  L: '24px',
  XL: '40px',
  XXL: '64px',
};

export const INITIAL_STEPS: BuildStep[] = [
  {
    id: 1,
    title: "Define Architecture",
    description: "Establish the core data structures and service patterns for the high-end build environment.",
    prompt: "Generate a robust TypeScript interface for a multi-tenant SaaS architecture following premium design patterns.",
    isCompleted: true
  },
  {
    id: 2,
    title: "Configure Design System",
    description: "Initialize the KodNest visual language, ensuring all components adhere to the strict 4-color palette.",
    prompt: "Create a Tailwind configuration that implements a 4-color limited palette and a fixed 8px grid system.",
    isCompleted: false
  }
];

export const INITIAL_PROOF_CHECKLIST: ProofItem[] = [
  { id: 'ui-built', label: 'UI Built', completed: false, proofValue: '' },
  { id: 'logic-working', label: 'Logic Working', completed: false, proofValue: '' },
  { id: 'test-passed', label: 'Test Passed', completed: false, proofValue: '' },
  { id: 'deployed', label: 'Deployed', completed: false, proofValue: '' },
];
