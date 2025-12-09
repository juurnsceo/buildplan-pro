
import React, { useState } from 'react';
import { ProjectList } from './components/ProjectList';
import { ProjectDetail } from './components/ProjectDetail';
import { useAppStore } from './store';
import { Task } from './types';
import { Loader2, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const { state, isLoading, isConfigured, addProject, addSubcontractor, addTask, updateTask, deleteTask, deleteSubcontractor } = useAppStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const selectedProject = state.projects.find(p => p.id === selectedProjectId);
  const projectSubs = state.subcontractors.filter(s => s.projectId === selectedProjectId);
  const projectTasks = state.tasks.filter(t => t.projectId === selectedProjectId);

  const handleAddSub = (subData: any) => {
    if (selectedProjectId) {
      addSubcontractor({ ...subData, projectId: selectedProjectId });
    }
  };

  const handleAddTask = (taskData: any) => {
     if (selectedProjectId) {
         addTask({ ...taskData, projectId: selectedProjectId });
     }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <p className="text-gray-500 font-medium">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {!isConfigured && (
        <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-center">
            <AlertTriangle size={14} className="mr-2" />
            <span><strong>Demo Mode:</strong> Data is saved to your browser (Local Storage). Configure <code>firebase.ts</code> to enable Cloud Sync.</span>
        </div>
      )}
      
      {selectedProjectId && selectedProject ? (
        <ProjectDetail 
          project={selectedProject}
          subcontractors={projectSubs}
          tasks={projectTasks}
          onBack={() => setSelectedProjectId(null)}
          onAddSub={handleAddSub}
          onAddTask={handleAddTask}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
        />
      ) : (
        <ProjectList 
          projects={state.projects}
          onSelectProject={setSelectedProjectId}
          onAddProject={addProject}
        />
      )}
    </div>
  );
};

export default App;
