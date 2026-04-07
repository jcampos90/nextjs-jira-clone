'use client';

import { useJira } from '@/app/context/JiraContext';

interface ProjectListProps {
  onSelectProject: () => void;
  onCreateProject: () => void;
}

export default function ProjectList({ onSelectProject, onCreateProject }: ProjectListProps) {
  const { projects, selectedProjectId, setSelectedProjectId, deleteProject, tickets } = useJira();

  const getTicketCount = (projectId: string) => {
    return tickets.filter((t) => t.projectId === projectId).length;
  };

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
            <button
              key={project.id}
              onClick={() => {
                setSelectedProjectId(project.id);
                onSelectProject();
              }}
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
                  {getTicketCount(project.id)}
                </span>
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
            </button>
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