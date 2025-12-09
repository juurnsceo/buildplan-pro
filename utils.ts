import { Task } from './types';

// Simple date helpers to avoid heavy dependencies for this specific demo
// In a real production app, date-fns or dayjs would be used.

export const parseDate = (dateStr: string): Date => {
  // Appends T00:00:00 to ensure local time interpretation if needed, 
  // but for simple YYYY-MM-DD comparisons, we stick to standard parsing.
  return new Date(dateStr + 'T00:00:00');
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const diffInDays = (d1: Date, d2: Date): number => {
  const t1 = d1.getTime();
  const t2 = d2.getTime();
  return Math.round((t1 - t2) / (1000 * 3600 * 24));
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Layout algorithm for overlapping tasks
// Returns a map of taskId -> verticalIndex (0, 1, 2...)
export const calculateTaskLanes = (tasks: Task[]): Record<string, number> => {
  if (tasks.length === 0) return {};

  // Sort tasks by start date
  const sortedTasks = [...tasks].sort((a, b) => 
    a.startDate.localeCompare(b.startDate)
  );

  const lanes: { endDate: string }[] = [];
  const taskLanes: Record<string, number> = {};

  sortedTasks.forEach(task => {
    let placed = false;
    
    // Try to find an existing lane where this task fits
    for (let i = 0; i < lanes.length; i++) {
      // If the lane's last task ends before this task starts, we can reuse it
      if (lanes[i].endDate < task.startDate) {
        lanes[i].endDate = task.endDate;
        taskLanes[task.id] = i;
        placed = true;
        break;
      }
    }

    // If no lane found, create a new one
    if (!placed) {
      lanes.push({ endDate: task.endDate });
      taskLanes[task.id] = lanes.length - 1;
    }
  });

  return taskLanes;
};

export const getProjectDateRange = (projectStart: string, tasks: Task[]) => {
  let start = projectStart;
  let end = projectStart;

  if (tasks.length > 0) {
    const dates = tasks.flatMap(t => [t.startDate, t.endDate]);
    dates.push(projectStart);
    dates.sort();
    start = dates[0];
    end = dates[dates.length - 1];
  }

  // Add buffer to end
  const endObj = parseDate(end);
  const bufferedEnd = addDays(endObj, 7); // 1 week buffer

  return {
    start,
    end: formatDate(bufferedEnd)
  };
};
