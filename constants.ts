import { Project, Subcontractor, Task } from './types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: '189 Quackenbush – New House',
    address: '189 Quackenbush Ln, Upstate NY',
    description: 'Ground-up residential construction of a 2,500 sqft single family home.',
    plannedStartDate: '2023-10-01',
    createdAt: Date.now(),
  },
  {
    id: 'p2',
    name: 'Downtown Office Reno',
    address: '400 Main St, Suite 300',
    description: 'Renovation of commercial office space.',
    plannedStartDate: '2023-11-15',
    createdAt: Date.now(),
  }
];

export const INITIAL_SUBCONTRACTORS: Subcontractor[] = [
  { id: 's1', projectId: 'p1', name: 'ABC Excavation', trade: 'Excavator' },
  { id: 's2', projectId: 'p1', name: 'Solid Foundations', trade: 'Concrete' },
  { id: 's3', projectId: 'p1', name: 'Top Notch Framing', trade: 'Framer' },
  { id: 's4', projectId: 'p1', name: 'Sparky Electric', trade: 'Electrician' },
  { id: 's5', projectId: 'p1', name: 'Flow Plumbing', trade: 'Plumber' },
  { id: 's6', projectId: 'p2', name: 'City Demolition', trade: 'Demolition' },
];

export const INITIAL_TASKS: Task[] = [
  { id: 't1', projectId: 'p1', subcontractorId: 's1', name: 'Site Clearing', startDate: '2023-10-01', endDate: '2023-10-05', status: 'completed', estimatedCost: 5000 },
  { id: 't2', projectId: 'p1', subcontractorId: 's1', name: 'Excavation', startDate: '2023-10-06', endDate: '2023-10-12', status: 'completed', estimatedCost: 10000 },
  { id: 't3', projectId: 'p1', subcontractorId: 's2', name: 'Footings', startDate: '2023-10-13', endDate: '2023-10-20', status: 'in-progress', estimatedCost: 12000 },
  { id: 't4', projectId: 'p1', subcontractorId: 's2', name: 'Foundation Walls', startDate: '2023-10-21', endDate: '2023-10-28', status: 'planned', estimatedCost: 16000 },
  { id: 't5', projectId: 'p1', subcontractorId: 's3', name: 'First Floor Framing', startDate: '2023-10-30', endDate: '2023-11-15', status: 'planned', estimatedCost: 20000 },
  { id: 't6', projectId: 'p1', subcontractorId: 's3', name: 'Second Floor Framing', startDate: '2023-11-16', endDate: '2023-11-30', status: 'planned', estimatedCost: 25000 },
  // Overlap example: Rough-in happens while framing upper levels
  { id: 't7', projectId: 'p1', subcontractorId: 's5', name: 'Plumbing Rough-in', startDate: '2023-11-20', endDate: '2023-12-05', status: 'planned', estimatedCost: 18000 },
  { id: 't8', projectId: 'p1', subcontractorId: 's4', name: 'Electrical Rough-in', startDate: '2023-11-25', endDate: '2023-12-10', status: 'planned', estimatedCost: 22000 },
];