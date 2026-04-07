'use client';

import { useState } from 'react';
import { Project } from '@/app/types';

interface ProjectFormProps {
  project?: Project | null;
  onSubmit: (data: { name: string; description: string; prefix: string }) => void;
  onClose: () => void;
}

export default function ProjectForm({ project, onSubmit, onClose }: ProjectFormProps) {
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [prefix, setPrefix] = useState(project?.prefix || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prefixValue = prefix.toUpperCase().slice(0, 2);
    onSubmit({ name, description, prefix: prefixValue });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-[#E8E4DD] dark:border-[#3D3D3D]">
          <div>
            <h2 className="text-xl font-display font-semibold text-[#1A1A1A] dark:text-[#E8E6E3]">
              {project ? 'Edit Project' : 'New Project'}
            </h2>
            <p className="text-sm text-[#8B8680] mt-1">
              {project ? 'Update project details' : 'Create a new project'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-[#8B8680] hover:text-[#1A1A1A] dark:hover:text-[#E8E6E3] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] dark:text-[#E8E6E3] mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter project name..."
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] dark:text-[#E8E6E3] mb-2">
              Ticket Prefix
            </label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 2))}
              required
              minLength={2}
              maxLength={2}
              placeholder="e.g., FM, JC, TP"
              className="input-field uppercase"
            />
            <p className="text-xs text-[#8B8680] mt-1">2-letter prefix for ticket numbers (e.g., FM-0001)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] dark:text-[#E8E6E3] mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief project description..."
              className="input-field resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {project ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}