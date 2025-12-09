export interface Project {
  id: string;
  name: string;
  address?: string;
  description?: string;
  plannedStartDate: string; // ISO Date string YYYY-MM-DD
  createdAt: number;
}

export interface Subcontractor {
  id: string;
  projectId: string;
  name: string;
  trade: string; // e.g., 'Plumber', 'Electrician'
  contactInfo?: string;
}

export type TaskStatus = 'planned' | 'in-progress' | 'completed';

export interface Task {
  id: string;
  projectId: string;
  subcontractorId: string;
  name: string;
  description?: string;
  startDate: string; // ISO Date string YYYY-MM-DD
  endDate: string; // ISO Date string YYYY-MM-DD
  status: TaskStatus;
  estimatedCost: number;
}

export interface AppState {
  projects: Project[];
  subcontractors: Subcontractor[];
  tasks: Task[];
}

export interface ProjectStats {
  totalEstimatedCost: number;
  taskCount: number;
  subcontractorCount: number;
  startDate: string;
  endDate: string;
  durationDays: number;
}