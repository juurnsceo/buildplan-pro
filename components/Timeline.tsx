
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Project, Subcontractor, Task } from '../types';
import { calculateTaskLanes, diffInDays, getProjectDateRange, parseDate, addDays, formatDate } from '../utils';
import { Plus, X, GripVertical } from 'lucide-react';

interface TimelineProps {
  project: Project;
  subcontractors: Subcontractor[];
  tasks: Task[];
  onAddTaskClick: (subId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask?: (task: Task) => void; // Added for drag updates
}

const PIXELS_PER_DAY = 40;
const HEADER_HEIGHT = 50;
const ROW_MIN_HEIGHT = 80;
const TASK_HEIGHT = 28;
const TASK_GAP = 8;
const RESIZE_HANDLE_WIDTH = 10; // Width of the edge interaction zone

type DragMode = 'move' | 'resize-left' | 'resize-right';

interface DragState {
  taskId: string;
  mode: DragMode;
  startX: number;
  originalStart: Date;
  originalEnd: Date;
  currentDiffDays: number;
}

export const Timeline: React.FC<TimelineProps> = ({ 
  project, 
  subcontractors, 
  tasks,
  onAddTaskClick,
  onEditTask,
  onDeleteTask,
  onUpdateTask
}) => {
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);

  // 1. Calculate Timeline Range
  const { start: startDateStr, end: endDateStr } = useMemo(() => 
    getProjectDateRange(project.plannedStartDate, tasks), 
    [project, tasks]
  );
  
  const startDate = parseDate(startDateStr);
  const endDate = parseDate(endDateStr);
  const totalDays = diffInDays(endDate, startDate) + 1;
  const timelineWidth = totalDays * PIXELS_PER_DAY;

  // 2. Generate Date Headers
  const dates = useMemo(() => {
    const arr = [];
    for (let i = 0; i < totalDays; i++) {
      const d = addDays(startDate, i);
      arr.push(d);
    }
    return arr;
  }, [startDate, totalDays]);

  // Global Mouse Handlers for Dragging
  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const pixelDiff = e.clientX - dragState.startX;
      const dayDiff = Math.round(pixelDiff / PIXELS_PER_DAY);
      
      setDragState(prev => prev ? { ...prev, currentDiffDays: dayDiff } : null);
    };

    const handleMouseUp = () => {
      if (dragState && onUpdateTask) {
        // Apply changes
        const { taskId, mode, originalStart, originalEnd, currentDiffDays } = dragState;
        
        if (currentDiffDays !== 0) {
          const taskToUpdate = tasks.find(t => t.id === taskId);
          if (taskToUpdate) {
            let newStart = originalStart;
            let newEnd = originalEnd;

            if (mode === 'move') {
              newStart = addDays(originalStart, currentDiffDays);
              newEnd = addDays(originalEnd, currentDiffDays);
            } else if (mode === 'resize-left') {
              newStart = addDays(originalStart, currentDiffDays);
              // Prevent start past end
              if (newStart > newEnd) newStart = newEnd; 
            } else if (mode === 'resize-right') {
              newEnd = addDays(originalEnd, currentDiffDays);
              // Prevent end before start
              if (newEnd < newStart) newEnd = newStart;
            }

            onUpdateTask({
              ...taskToUpdate,
              startDate: formatDate(newStart),
              endDate: formatDate(newEnd)
            });
          }
        }
      }
      setDragState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, tasks, onUpdateTask]);


  // 3. Prepare Subcontractor Rows
  const subRows = useMemo(() => {
    return subcontractors.map(sub => {
      const subTasks = tasks.filter(t => t.subcontractorId === sub.id);
      const lanes = calculateTaskLanes(subTasks);
      const maxLane = Object.values(lanes).length > 0 ? Math.max(...Object.values(lanes)) : 0;
      const rowHeight = Math.max(ROW_MIN_HEIGHT, 40 + (maxLane + 1) * (TASK_HEIGHT + TASK_GAP));
      
      return {
        sub,
        tasks: subTasks,
        lanes,
        height: rowHeight
      };
    });
  }, [subcontractors, tasks]);

  const renderGridLines = () => {
    return dates.map((date, i) => {
        const isWeekStart = date.getDay() === 1; // Monday
        return (
            <div
                key={i}
                className={`absolute top-0 bottom-0 border-r ${isWeekStart ? 'border-gray-300' : 'border-gray-100'}`}
                style={{ left: (i + 1) * PIXELS_PER_DAY }}
            />
        );
    });
  };

  const handleMouseDown = (e: React.MouseEvent, task: Task, mode: DragMode) => {
    e.stopPropagation();
    // Don't start drag if right click
    if (e.button !== 0) return;

    setDragState({
      taskId: task.id,
      mode,
      startX: e.clientX,
      originalStart: parseDate(task.startDate),
      originalEnd: parseDate(task.endDate),
      currentDiffDays: 0
    });
  };

  return (
    <div className="flex flex-col h-full bg-white border rounded-lg shadow-sm overflow-hidden select-none">
      {/* Header Row */}
      <div className="flex border-b border-gray-200 bg-gray-50 z-10">
        <div className="w-64 flex-shrink-0 p-4 font-semibold text-gray-700 border-r border-gray-200 bg-gray-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
          Subcontractors
        </div>
        
        <div className="flex-1 overflow-hidden relative">
           <div className="overflow-x-auto timeline-scroll custom-scrollbar" style={{ overflowY: 'hidden' }}>
              <div style={{ width: timelineWidth, height: HEADER_HEIGHT }} className="relative">
                {dates.map((date, i) => (
                  <div 
                    key={i} 
                    className="absolute bottom-0 text-xs text-gray-500 border-l border-gray-200 pl-1 pb-1 truncate"
                    style={{ left: i * PIXELS_PER_DAY, width: PIXELS_PER_DAY, height: '100%' }}
                  >
                     <span className="font-medium text-gray-900 block">{date.getDate()}</span>
                     {date.toLocaleString('default', { month: 'short' })}
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>

      {/* Body Rows */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex">
         
         {/* Left Side: Subcontractor Names */}
         <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
           {subRows.map(({ sub, height }) => (
             <div 
                key={sub.id} 
                className="border-b border-gray-100 flex flex-col justify-center px-4 py-2 hover:bg-gray-50 group relative"
                style={{ height }}
             >
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white shadow"
                    style={{ backgroundColor: sub.tradeColor || '#2563eb' }}
                  />
                  <span className="font-medium text-gray-900">{sub.name}</span>
                </div>
                <div className="text-sm text-gray-500">{sub.trade || 'Unassigned Trade'}</div>
                <button 
                  onClick={() => onAddTaskClick(sub.id)}
                  className="mt-2 text-xs flex items-center text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus size={14} className="mr-1" /> Add Task
                </button>
             </div>
           ))}
           {subRows.length === 0 && (
             <div className="p-4 text-sm text-gray-400 italic">No subcontractors added yet.</div>
           )}
         </div>

         {/* Right Side: Timeline Content */}
         <div className="flex-1 overflow-x-auto timeline-scroll relative" id="timeline-container">
            <div style={{ width: timelineWidth }} className="relative min-h-full">
               <div className="absolute inset-0 z-0 pointer-events-none">
                 {renderGridLines()}
               </div>

               {subRows.map(({ sub, tasks, lanes, height }) => (
                 <div 
                   key={sub.id} 
                   className="relative border-b border-gray-100 w-full"
                   style={{ height }}
                 >
                    {tasks.map(task => {
                       // Determine visual dates (either real or being dragged)
                       let visualStartDate = parseDate(task.startDate);
                       let visualEndDate = parseDate(task.endDate);

                       const isDragging = dragState?.taskId === task.id;

                       if (isDragging && dragState) {
                          if (dragState.mode === 'move') {
                             visualStartDate = addDays(dragState.originalStart, dragState.currentDiffDays);
                             visualEndDate = addDays(dragState.originalEnd, dragState.currentDiffDays);
                          } else if (dragState.mode === 'resize-left') {
                             visualStartDate = addDays(dragState.originalStart, dragState.currentDiffDays);
                             // Visual constraint
                             if (visualStartDate > visualEndDate) visualStartDate = visualEndDate;
                          } else if (dragState.mode === 'resize-right') {
                             visualEndDate = addDays(dragState.originalEnd, dragState.currentDiffDays);
                             // Visual constraint
                             if (visualEndDate < visualStartDate) visualEndDate = visualStartDate;
                          }
                       }

                       const startDiff = diffInDays(visualStartDate, startDate);
                       const duration = diffInDays(visualEndDate, visualStartDate) + 1;
                       const laneIndex = lanes[task.id] || 0;
                       const top = 20 + (laneIndex * (TASK_HEIGHT + TASK_GAP));
                       
                       const tradeColor = sub.tradeColor || '#2563eb';

                       // Cursor styles
                       const cursorClass = isDragging ? 'cursor-grabbing' : 'cursor-grab';

                       return (
                         <div
                           key={task.id}
                           className={`absolute rounded-md shadow-sm text-white text-xs flex items-center group transition-colors ${isDragging ? 'z-50 shadow-lg ring-2 ring-blue-300' : 'z-10'}`}
                           style={{
                             left: startDiff * PIXELS_PER_DAY,
                             width: Math.max(duration * PIXELS_PER_DAY - 4, 10),
                             height: TASK_HEIGHT,
                             top: top,
                             backgroundColor: tradeColor,
                           }}
                           onMouseEnter={() => setHoveredTask(task.id)}
                           onMouseLeave={() => setHoveredTask(null)}
                         >
                            {/* Left Resize Handle */}
                            <div 
                                className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-white/20 z-20 rounded-l-md"
                                onMouseDown={(e) => handleMouseDown(e, task, 'resize-left')}
                            />

                            {/* Center Move Area */}
                            <div 
                                className={`flex-1 h-full flex items-center px-2 truncate ${cursorClass}`}
                                onMouseDown={(e) => handleMouseDown(e, task, 'move')}
                                onClick={(e) => {
                                    // Only trigger edit if we didn't just drag
                                    if (dragState?.currentDiffDays === 0 || !dragState) {
                                        onEditTask(task);
                                    }
                                }}
                            >
                                <span className="truncate font-medium drop-shadow-md pointer-events-none select-none">{task.name}</span>
                            </div>

                            {/* Right Resize Handle */}
                            <div 
                                className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-white/20 z-20 rounded-r-md"
                                onMouseDown={(e) => handleMouseDown(e, task, 'resize-right')}
                            />
                            
                            {/* Delete Button (Only show if not dragging) */}
                            {hoveredTask === task.id && !isDragging && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-0.5 shadow-sm hover:bg-red-200 z-30"
                                >
                                    <X size={12} />
                                </button>
                            )}
                         </div>
                       );
                    })}
                 </div>
               ))}
            </div>
         </div>
      </div>

      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 flex gap-4 text-xs text-gray-600 justify-between items-center">
        <div className="text-xs text-gray-600">
            Task bars inherit the color selected for their trade.
        </div>
        <div className="text-gray-400 italic">
            Drag center to move / Drag edges to trim or extend
        </div>
      </div>
    </div>
  );
};
