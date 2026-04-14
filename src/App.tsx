/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TaskCreation from './components/TaskCreation';
import TaskViewModal from './components/TaskViewModal';
import AI from './components/AI';
import HealthTracker from './components/HealthTracker';
import CareerCRM from './components/CareerCRM';
import Timer from './components/Timer';
import Tasks from './components/Tasks';
import Analytics from './components/Analytics';
import Goals from './components/Goals';
import Settings from './components/Settings';
import Onboarding from './components/Onboarding';
import Placeholder from './components/Placeholder';
import { AnimatePresence } from 'motion/react';

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isTaskViewModalOpen, setIsTaskViewModalOpen] = useState(false);
  const [initialTaskTab, setInitialTaskTab] = useState<'manual' | 'scan' | 'voice'>('manual');
  const [editingTask, setEditingTask] = useState<any>(null);
  const [viewingTask, setViewingTask] = useState<any>(null);
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Review Q2 Strategy', priority: 'P1', category: 'Work', time: '1h', status: 'todo', date: new Date().toISOString().split('T')[0] },
    { id: '2', title: 'Morning Workout', priority: 'P2', category: 'Health', time: '45m', status: 'in-progress', date: new Date().toISOString().split('T')[0] },
    { id: '3', title: 'Update Personal OS', priority: 'P3', category: 'Side Project', time: '2h', status: 'todo', date: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
    { id: '4', title: 'Buy Groceries', priority: 'P4', category: 'Personal', time: '30m', status: 'done', date: new Date().toISOString().split('T')[0] },
    { id: '5', title: 'Weekly Planning', priority: 'P2', category: 'Personal', time: '1h', status: 'todo', date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0] },
  ]);

  const todayTasks = tasks.filter(t => t.date === new Date().toISOString().split('T')[0] || !t.date);

  const handleOpenTaskModal = (tabOrTask: 'manual' | 'scan' | 'voice' | any = 'manual') => {
    if (typeof tabOrTask === 'object') {
      setInitialTaskTab('manual');
      setEditingTask(tabOrTask);
    } else {
      setInitialTaskTab(tabOrTask);
      setEditingTask(null);
    }
    setIsTaskModalOpen(true);
  };

  const handleViewTask = (task: any) => {
    setViewingTask(task);
    setIsTaskViewModalOpen(true);
  };

  const handleSaveTask = (newTask: any) => {
    if (newTask.id) {
      setTasks(prev => prev.map(t => t.id === newTask.id ? { ...t, ...newTask } : t));
    } else {
      const task = {
        ...newTask,
        id: Math.random().toString(36).substr(2, 9),
        time: newTask.time || '1h',
        status: newTask.status || 'todo'
      };
      setTasks(prev => [task, ...prev]);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Dashboard 
            tasks={todayTasks}
            onNavigateToAI={() => setActiveTab('ai')} 
            onNavigateToHealth={() => setActiveTab('health')}
            onNavigateToCareer={() => setActiveTab('career')}
            onNavigateToTimer={() => setActiveTab('timer')}
            onOpenTaskModal={handleOpenTaskModal}
            onViewTask={handleViewTask}
          />
        );
      case 'ai':
        return <AI onSaveTask={handleSaveTask} tasks={tasks} />;
      case 'health':
        return <HealthTracker />;
      case 'career':
        return <CareerCRM />;
      case 'timer':
        return <Timer />;
      case 'tasks':
        return <Tasks tasks={tasks} onViewTask={handleViewTask} onOpenTaskModal={handleOpenTaskModal} />;
      case 'analytics':
        return <Analytics />;
      case 'goals':
        return <Goals />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard tasks={tasks} />;
    }
  };

  return (
    <>
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onOpenTaskModal={handleOpenTaskModal}
      >
        {renderContent()}
        
        <AnimatePresence>
          {isTaskModalOpen && (
            <TaskCreation 
              initialTab={initialTaskTab}
              initialTask={editingTask}
              onClose={() => setIsTaskModalOpen(false)} 
              onSave={handleSaveTask}
            />
          )}
          {isTaskViewModalOpen && viewingTask && (
            <TaskViewModal
              task={viewingTask}
              onClose={() => setIsTaskViewModalOpen(false)}
              onUpdateTask={(updatedTask) => {
                handleSaveTask(updatedTask);
                setViewingTask(updatedTask);
              }}
              onEdit={(task) => {
                setIsTaskViewModalOpen(false);
                handleOpenTaskModal(task);
              }}
            />
          )}
        </AnimatePresence>
      </Layout>
      <AnimatePresence>
        {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
      </AnimatePresence>
    </>
  );
}
