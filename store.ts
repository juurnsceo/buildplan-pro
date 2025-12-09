
import { useState, useEffect, useCallback } from 'react';
import { Project, Subcontractor, Task, AppState, Trade } from './types';
import { db, isConfigured } from './firebase';
import { INITIAL_PROJECTS, INITIAL_SUBCONTRACTORS, INITIAL_TASKS, INITIAL_TRADES } from './constants';
import { v4 as uuidv4 } from 'uuid';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';

export const useAppStore = () => {
  const [state, setState] = useState<AppState>({
    projects: [],
    subcontractors: [],
    tasks: [],
    trades: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  // 1. Set up Listeners (Firestore OR LocalStorage)
  useEffect(() => {
    if (!isConfigured) {
      console.warn("BuildPlan Pro: Firebase not configured. Using Local Storage (Demo Mode).");
      
      const localProjects = localStorage.getItem('bp_projects');
      if (!localProjects) {
        // Seed initial data
        localStorage.setItem('bp_projects', JSON.stringify(INITIAL_PROJECTS));
        localStorage.setItem('bp_subcontractors', JSON.stringify(INITIAL_SUBCONTRACTORS));
        localStorage.setItem('bp_tasks', JSON.stringify(INITIAL_TASKS));
        localStorage.setItem('bp_trades', JSON.stringify(INITIAL_TRADES));
        setState({
          projects: INITIAL_PROJECTS,
          subcontractors: INITIAL_SUBCONTRACTORS,
          tasks: INITIAL_TASKS,
          trades: INITIAL_TRADES,
        });
      } else {
        const storedTrades = localStorage.getItem('bp_trades');
        if (!storedTrades) {
          localStorage.setItem('bp_trades', JSON.stringify(INITIAL_TRADES));
        }
        // Load from storage
        setState({
          projects: JSON.parse(localProjects),
          subcontractors: JSON.parse(localStorage.getItem('bp_subcontractors') || '[]'),
          tasks: JSON.parse(localStorage.getItem('bp_tasks') || '[]'),
          trades: storedTrades ? JSON.parse(storedTrades) : INITIAL_TRADES,
        });
      }
      setIsLoading(false);
      return;
    }

    // Firebase Listeners
    const qProjects = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubProjects = onSnapshot(qProjects, (snapshot) => {
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setState(prev => ({ ...prev, projects }));
    });

    const unsubSubs = onSnapshot(collection(db, 'subcontractors'), (snapshot) => {
      const subcontractors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subcontractor));
      setState(prev => ({ ...prev, subcontractors }));
    });

    const unsubTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setState(prev => ({ ...prev, tasks }));
      setIsLoading(false);
    });

    const unsubTrades = onSnapshot(collection(db, 'trades'), (snapshot) => {
      const trades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trade));
      setState(prev => ({ ...prev, trades }));
    });

    return () => {
      unsubProjects();
      unsubSubs();
      unsubTasks();
      unsubTrades();
    };
  }, []);

  // Helpers for Local Storage Updates
  const updateLocal = (key: keyof AppState, newData: any[]) => {
    localStorage.setItem(`bp_${key}`, JSON.stringify(newData));
    setState(prev => ({ ...prev, [key]: newData }));
  };

  // 2. Actions (Handle both modes)

  const addProject = useCallback(async (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject = { ...projectData, createdAt: Date.now() };

    if (!isConfigured) {
      const p = { ...newProject, id: uuidv4() } as Project;
      updateLocal('projects', [p, ...state.projects]);
      return p.id;
    }

    try {
      const docRef = await addDoc(collection(db, 'projects'), newProject);
      return docRef.id;
    } catch (e) {
      console.error("Error adding project: ", e);
    }
  }, [state.projects]);

  const addSubcontractor = useCallback(async (subData: Omit<Subcontractor, 'id'>) => {
    if (!isConfigured) {
      const s = { ...subData, id: uuidv4() } as Subcontractor;
      updateLocal('subcontractors', [...state.subcontractors, s]);
      return s.id;
    }

    try {
      const docRef = await addDoc(collection(db, 'subcontractors'), subData);
      return docRef.id;
    } catch (e) {
      console.error("Error adding sub: ", e);
    }
  }, [state.subcontractors]);

  const addTrade = useCallback(async (tradeData: Omit<Trade, 'id'>) => {
    if (!isConfigured) {
      const trade = { ...tradeData, id: uuidv4() } as Trade;
      updateLocal('trades', [...state.trades, trade]);
      return trade.id;
    }

    try {
      const docRef = await addDoc(collection(db, 'trades'), tradeData);
      return docRef.id;
    } catch (e) {
      console.error("Error adding trade: ", e);
    }
  }, [state.trades]);

  const addTask = useCallback(async (taskData: Omit<Task, 'id'>) => {
    if (!isConfigured) {
      const t = { ...taskData, id: uuidv4() } as Task;
      updateLocal('tasks', [...state.tasks, t]);
      return;
    }

    try {
      await addDoc(collection(db, 'tasks'), taskData);
    } catch (e) {
      console.error("Error adding task: ", e);
    }
  }, [state.tasks]);

  const updateTask = useCallback(async (updatedTask: Task) => {
    if (!isConfigured) {
      const newTasks = state.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
      updateLocal('tasks', newTasks);
      return;
    }

    try {
      const taskRef = doc(db, 'tasks', updatedTask.id);
      const { id, ...data } = updatedTask;
      await updateDoc(taskRef, data);
    } catch (e) {
      console.error("Error updating task: ", e);
    }
  }, [state.tasks]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!isConfigured) {
      const newTasks = state.tasks.filter(t => t.id !== taskId);
      updateLocal('tasks', newTasks);
      return;
    }

    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (e) {
      console.error("Error deleting task: ", e);
    }
  }, [state.tasks]);

  const deleteSubcontractor = useCallback(async (subId: string) => {
    if (!isConfigured) {
       const newSubs = state.subcontractors.filter(s => s.id !== subId);
       updateLocal('subcontractors', newSubs);
       return;
    }

    try {
       await deleteDoc(doc(db, 'subcontractors', subId));
    } catch (e) {
        console.error("Error deleting sub: ", e);
    }
  }, [state.subcontractors]);

  return {
    state,
    isLoading,
    isConfigured, // Export this so UI can show a warning
    addProject,
    addSubcontractor,
    addTask,
    updateTask,
    deleteTask,
    deleteSubcontractor,
    addTrade
  };
};
