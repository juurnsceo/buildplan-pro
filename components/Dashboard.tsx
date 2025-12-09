
import React, { useMemo } from 'react';
import { Project, Subcontractor, Task, ProjectStats } from '../types';
import { formatCurrency, diffInDays, parseDate, getProjectDateRange } from '../utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, DollarSign, Users, Layers } from 'lucide-react';

interface DashboardProps {
  project: Project;
  subcontractors: Subcontractor[];
  tasks: Task[];
}

export const Dashboard: React.FC<DashboardProps> = ({ project, subcontractors, tasks }) => {
  
  const stats: ProjectStats = useMemo(() => {
    // Calculate total cost by summing all task costs
    const totalCost = tasks.reduce((acc, task) => acc + (task.estimatedCost || 0), 0);
    const range = getProjectDateRange(project.plannedStartDate, tasks);
    const duration = diffInDays(parseDate(range.end), parseDate(range.start));

    return {
      totalEstimatedCost: totalCost,
      taskCount: tasks.length,
      subcontractorCount: subcontractors.length,
      startDate: range.start,
      endDate: range.end,
      durationDays: duration
    };
  }, [project, subcontractors, tasks]);

  const chartData = useMemo(() => {
    // Aggregate costs by subcontractor ID
    const subCosts = tasks.reduce((acc, task) => {
        acc[task.subcontractorId] = (acc[task.subcontractorId] || 0) + (task.estimatedCost || 0);
        return acc;
    }, {} as Record<string, number>);

    return subcontractors.map(sub => ({
      name: sub.name,
      cost: subCosts[sub.id] || 0,
      trade: sub.trade
    })).sort((a, b) => b.cost - a.cost);
  }, [subcontractors, tasks]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Budget</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalEstimatedCost)}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="text-xl font-bold text-gray-900">{stats.durationDays} Days</p>
            <p className="text-xs text-gray-400">{stats.startDate} - {stats.endDate}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Subcontractors</p>
            <p className="text-xl font-bold text-gray-900">{stats.subcontractorCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
            <Layers size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Tasks</p>
            <p className="text-xl font-bold text-gray-900">{stats.taskCount}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost by Subcontractor</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(value) => `$${value/1000}k`} />
                  <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12}} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    cursor={{fill: 'transparent'}}
                  />
                  <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
           <h3 className="text-lg font-semibold text-gray-800 mb-4">Budget Distribution</h3>
           <div className="flex flex-col space-y-3 h-80 overflow-y-auto pr-2">
              {chartData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length]}}></div>
                          <div>
                              <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                              <p className="text-xs text-gray-500">{item.trade}</p>
                          </div>
                      </div>
                      <div className="text-right">
                          <p className="font-semibold text-gray-900 text-sm">{formatCurrency(item.cost)}</p>
                          <p className="text-xs text-gray-400">{stats.totalEstimatedCost > 0 ? ((item.cost / stats.totalEstimatedCost) * 100).toFixed(1) : 0}%</p>
                      </div>
                  </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
