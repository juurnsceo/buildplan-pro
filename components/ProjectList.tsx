
import React, { useState } from 'react';
import { Project } from '../types';
import { Plus, Building, Calendar, ArrowRight } from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
  onAddProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, onSelectProject, onAddProject }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProject({
      name,
      address,
      description,
      plannedStartDate: startDate,
    });
    setIsModalOpen(false);
    setName('');
    setAddress('');
    setDescription('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-500 mt-1">Manage construction schedules and budgets</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={20} className="mr-2" /> New Project
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div 
              key={project.id} 
              onClick={() => onSelectProject(project.id)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer flex flex-col h-64"
            >
              <div className="flex items-start justify-between mb-4">
                 <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <Building size={24} />
                 </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate">{project.name}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">{project.description || project.address}</p>
              
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                 <div className="flex items-center text-gray-500">
                    <Calendar size={14} className="mr-1.5" />
                    Start: {project.plannedStartDate}
                 </div>
                 <div className="flex items-center text-blue-600 font-medium group">
                    View <ArrowRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 m-4 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Project</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input 
                  required 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" 
                  placeholder="e.g. 123 Maple Ave Reno" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
                <input 
                  type="text" 
                  value={address} 
                  onChange={e => setAddress(e.target.value)} 
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" 
                  placeholder="Street address, City, State" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" 
                  placeholder="Brief overview of the scope..." 
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Planned Start Date</label>
                <input 
                  required 
                  type="date" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)} 
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" 
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
