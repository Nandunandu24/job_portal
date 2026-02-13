
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
