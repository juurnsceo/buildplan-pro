
import React, { useEffect, useState } from 'react';
import { Project, Subcontractor, Task, Trade } from '../types';
import { Timeline } from './Timeline';
import { Dashboard } from './Dashboard';
import { ArrowLeft, Plus, Calendar, LayoutDashboard } from 'lucide-react';

interface ProjectDetailProps {
  project: Project;
  subcontractors: Subcontractor[];
  trades: Trade[];
  tasks: Task[];
  onBack: () => void;
  onAddSub: (sub: Omit<Subcontractor, 'id' | 'projectId'>) => Promise<string | void>;
  onAddTrade: (trade: Omit<Trade, 'id'>) => Promise<string | void>;
  onAddTask: (task: Omit<Task, 'id' | 'projectId'>) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  subcontractors,
  trades,
  tasks,
  onBack,
  onAddSub,
  onAddTrade,
  onAddTask,
  onUpdateTask,
  onDeleteTask
}) => {
  const ADD_NEW_OPTION = '__add_new_sub';
  const PENDING_OPTION = '__pending_sub';
  const PENDING_NAME = 'Pending Subcontractor';
  const NEW_TRADE_OPTION = '__new_trade';

  const [activeTab, setActiveTab] = useState<'schedule' | 'dashboard' | 'team'>('schedule');
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedSubForTask, setSelectedSubForTask] = useState<string>('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Form states
  const [newSubName, setNewSubName] = useState('');
  const [selectedTradeId, setSelectedTradeId] = useState('');
  const [isAddingNewTrade, setIsAddingNewTrade] = useState(false);
  const [newTradeName, setNewTradeName] = useState('');
  const [newTradeColor, setNewTradeColor] = useState('#3b82f6');

  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskStart, setNewTaskStart] = useState('');
  const [newTaskEnd, setNewTaskEnd] = useState('');
  const [newTaskCost, setNewTaskCost] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('planned');

  useEffect(() => {
    if (!isAddingNewTrade && trades.length > 0) {
      const existingSelection = trades.find(t => t.id === selectedTradeId);
      if (!existingSelection) {
        const fallback = trades[0];
        setSelectedTradeId(fallback.id);
        setNewTradeColor(fallback.color);
      }
    }
  }, [trades, selectedTradeId, isAddingNewTrade]);

  const openSubcontractorModal = () => {
    if (trades.length > 0) {
      const fallback = trades.find(t => t.id === selectedTradeId) || trades[0];
      setSelectedTradeId(fallback.id);
      setNewTradeColor(fallback.color);
      setIsAddingNewTrade(false);
    } else {
      setSelectedTradeId('');
      setIsAddingNewTrade(true);
      setNewTradeColor('#3b82f6');
    }
    setNewSubName('');
    setNewTradeName('');
    setIsSubModalOpen(true);
  };

  const closeSubcontractorModal = () => {
    setIsSubModalOpen(false);
    if (trades.length > 0) {
      setSelectedTradeId(trades[0].id);
      setNewTradeColor(trades[0].color);
      setIsAddingNewTrade(false);
    } else {
      setSelectedTradeId('');
      setIsAddingNewTrade(true);
      setNewTradeColor('#3b82f6');
    }
    setNewSubName('');
    setNewTradeName('');
  };

  const handleSubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let tradeIdToUse = selectedTradeId;

    if (isAddingNewTrade || (!tradeIdToUse && newTradeName.trim())) {
      if (!newTradeName.trim()) {
        alert('Please provide a trade name.');
        return;
      }
      const createdTradeId = await onAddTrade({
        name: newTradeName.trim(),
        color: newTradeColor,
      });
      if (!createdTradeId) return;
      tradeIdToUse = createdTradeId;
      setSelectedTradeId(createdTradeId);
      setIsAddingNewTrade(false);
    }

    if (!tradeIdToUse) {
      alert('Select or create a trade for this subcontractor.');
      return;
    }

    const tradeMeta = trades.find(t => t.id === tradeIdToUse);
    const createdId = await onAddSub({
      name: newSubName,
      tradeId: tradeIdToUse,
      trade: tradeMeta?.name || newTradeName.trim(),
    });
    setNewSubName('');
    setNewTradeName('');
    setIsAddingNewTrade(false);
    setIsSubModalOpen(false);
    setSelectedTradeId(tradeIdToUse);
    if (createdId) {
      setSelectedSubForTask(createdId);
    }
  };

  const ensurePendingSubcontractor = async () => {
    const existing = subcontractors.find(s => s.name === PENDING_NAME);
    if (existing) {
      setSelectedSubForTask(existing.id);
      return;
    }
    let pendingTrade = trades.find(t => t.name === 'Pending');
    if (!pendingTrade) {
      const created = await onAddTrade({ name: 'Pending', color: '#9ca3af' });
      if (created) {
        pendingTrade = { id: created, name: 'Pending', color: '#9ca3af' };
      }
    }
    const pendingId = await onAddSub({
      name: PENDING_NAME,
      tradeId: pendingTrade?.id,
      trade: pendingTrade?.name || 'Pending',
    });
    if (pendingId) {
      setSelectedSubForTask(pendingId);
    }
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubForTask) {
      alert('Please select a subcontractor for this task.');
      return;
    }
    
    const taskData = {
        subcontractorId: selectedSubForTask,
        name: newTaskName,
        startDate: newTaskStart,
        endDate: newTaskEnd,
        estimatedCost: parseFloat(newTaskCost) || 0,
        status: newTaskStatus as any,
    };

    if (editingTaskId) {
        onUpdateTask({
            ...taskData,
            id: editingTaskId,
            projectId: project.id
        } as Task);
    } else {
        onAddTask(taskData);
    }

    setNewTaskName('');
    setNewTaskStart('');
    setNewTaskEnd('');
    setNewTaskCost('');
    setIsTaskModalOpen(false);
    setEditingTaskId(null);
  };

  const openTaskModal = (subId?: string, taskToEdit?: Task) => {
    if (taskToEdit) {
        setEditingTaskId(taskToEdit.id);
        setSelectedSubForTask(taskToEdit.subcontractorId);
        setNewTaskName(taskToEdit.name);
        setNewTaskStart(taskToEdit.startDate);
        setNewTaskEnd(taskToEdit.endDate);
        setNewTaskCost(taskToEdit.estimatedCost?.toString() || '');
        setNewTaskStatus(taskToEdit.status);
    } else {
        setEditingTaskId(null);
        if (subId) setSelectedSubForTask(subId);
        else if (subcontractors.length > 0) setSelectedSubForTask(subcontractors[0].id);
        else setSelectedSubForTask('');
        
        // Default values
        const today = new Date();
        setNewTaskStart(today.toISOString().split('T')[0]);
        setNewTaskEnd(today.toISOString().split('T')[0]);
        setNewTaskName('');
        setNewTaskCost('');
        setNewTaskStatus('planned');
    }
    setIsTaskModalOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-sm text-gray-500">{project.address}</p>
          </div>
        </div>
        
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'schedule' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Calendar size={16} className="mr-2" /> Schedule
          </button>
          <button 
             onClick={() => setActiveTab('dashboard')}
             className={`flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <LayoutDashboard size={16} className="mr-2" /> Dashboard
          </button>
        </div>

        <div className="flex space-x-3">
          <button 
             onClick={() => openTaskModal()}
             className="flex items-center px-3 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 shadow-sm"
          >
            <Plus size={16} className="mr-2" /> Add Task
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden p-4 relative">
        {activeTab === 'schedule' && (
          <Timeline 
            project={project}
            subcontractors={subcontractors}
            tasks={tasks}
            onAddTaskClick={(subId) => openTaskModal(subId)}
            onEditTask={(task) => openTaskModal(undefined, task)}
            onDeleteTask={onDeleteTask}
            onUpdateTask={onUpdateTask}
          />
        )}
        {activeTab === 'dashboard' && (
          <div className="h-full overflow-y-auto">
             <Dashboard project={project} subcontractors={subcontractors} tasks={tasks} />
          </div>
        )}
      </main>

      {/* Add Subcontractor Modal */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
            <h2 className="text-lg font-bold mb-4">Add Subcontractor</h2>
            <form onSubmit={handleSubSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input required type="text" value={newSubName} onChange={e => setNewSubName(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="e.g. ABC Excavation" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Trade / Role</label>
                <select
                  value={isAddingNewTrade || trades.length === 0 ? NEW_TRADE_OPTION : selectedTradeId}
                  onChange={e => {
                    const value = e.target.value;
                    if (value === NEW_TRADE_OPTION) {
                      setIsAddingNewTrade(true);
                      setSelectedTradeId('');
                      setNewTradeName('');
                      setNewTradeColor('#3b82f6');
                      return;
                    }
                    setIsAddingNewTrade(false);
                    setSelectedTradeId(value);
                    const trade = trades.find(t => t.id === value);
                    if (trade) {
                      setNewTradeColor(trade.color);
                    }
                  }}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  {trades.length > 0 && trades.map(trade => (
                    <option key={trade.id} value={trade.id}>
                      {trade.name}
                    </option>
                  ))}
                  <option value={NEW_TRADE_OPTION}>+ Add New Trade</option>
                </select>
              </div>
              { (isAddingNewTrade || trades.length === 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">New Trade Name</label>
                    <input 
                      required 
                      type="text" 
                      value={newTradeName} 
                      onChange={e => setNewTradeName(e.target.value)} 
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                      placeholder="e.g. Plumber" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bar Color</label>
                    <div className="mt-1 flex items-center space-x-3">
                      <input 
                        type="color" 
                        value={newTradeColor} 
                        onChange={e => setNewTradeColor(e.target.value)} 
                        className="h-10 w-14 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={newTradeColor}
                        onChange={e => setNewTradeColor(e.target.value)}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={closeSubcontractorModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Add Subcontractor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
            <h2 className="text-lg font-bold mb-4">{editingTaskId ? 'Edit Schedule Task' : 'Add Schedule Task'}</h2>
            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Subcontractor</label>
                <select 
                    value={selectedSubForTask} 
                    onChange={async e => {
                      const value = e.target.value;
                      if (value === ADD_NEW_OPTION) {
                        openSubcontractorModal();
                        return;
                      }
                      if (value === PENDING_OPTION) {
                        await ensurePendingSubcontractor();
                        return;
                      }
                      setSelectedSubForTask(value);
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                    <option value="" disabled>Select a subcontractor</option>
                    {subcontractors.map(s => <option key={s.id} value={s.id}>{s.name} ({s.trade})</option>)}
                    <option value={ADD_NEW_OPTION}>+ Add New Subcontractor</option>
                    <option value={PENDING_OPTION}>Pending Subcontractor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Task Name</label>
                <input required type="text" value={newTaskName} onChange={e => setNewTaskName(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="e.g. Rough-in" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input required type="date" value={newTaskStart} onChange={e => setNewTaskStart(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input required type="date" value={newTaskEnd} onChange={e => setNewTaskEnd(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                  </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estimated Cost ($)</label>
                <input required type="number" value={newTaskCost} onChange={e => setNewTaskCost(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select value={newTaskStatus} onChange={e => setNewTaskStatus(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                    <option value="planned">Planned</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    {editingTaskId ? 'Update Task' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
