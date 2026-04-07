'use client';

import { useMemo, useCallback, useRef } from 'react';
import { useJira } from '@/app/context/JiraContext';

interface ProjectListProps {
  onSelectProject: () => void;
  onCreateProject: () => void;
  onSettingsClick: (projectId: string) => void;
}

export default function ProjectList({ onSelectProject, onCreateProject, onSettingsClick }: ProjectListProps) {
  const { projects, selectedProjectId, setSelectedProjectId, deleteProject, tickets } = useJira();

  const ticketCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const ticket of tickets) {
      map.set(ticket.projectId, (map.get(ticket.projectId) ?? 0) + 1);
    }
    return map;
  }, [tickets]);

  const handleSelect = useRef(onSelectProject).current;

  const handleProjectClick = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
    handleSelect();
  }, [setSelectedProjectId, handleSelect]);

  return (
    <aside className="w-72 bg-white dark:bg-[#1e293b] border-r border-slate-200 dark:border-slate-700 flex flex-col">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-[#1a3a4a] rounded-md flex items-center justify-center shadow-lg shadow-[#1a3a4a]/20">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-slate-100">Taskflow</h2>
        </div>
        <p className="text-xs text-slate-500">Project Management</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 px-3">
          Projects
        </div>
        <nav className="space-y-1">
          {projects.map((project, index) => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-all duration-200 animate-fade-in stagger-${index + 1} ${
                selectedProjectId === project.id
                  ? 'bg-[#c2e7ff]/20 dark:bg-[#1a3a4a]/30 shadow-sm border-l-2 border-[#1a3a4a]'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-2 h-2 rounded-full ${selectedProjectId === project.id ? 'bg-[#1a3a4a]' : 'bg-slate-300 dark:bg-slate-600'}`} />
                <span className={`text-sm truncate ${
                  selectedProjectId === project.id 
                    ? 'text-slate-900 dark:text-slate-100 font-medium' 
                    : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {project.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded">
                  {ticketCountMap.get(project.id) ?? 0}
                </span>
                {project.id !== 'default' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSettingsClick(project.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                )}
                {project.id !== 'default' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete project "${project.name}"? All tickets in this project will be deleted.`)) {
                        deleteProject(project.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={onCreateProject}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>
    </aside>
  );
}