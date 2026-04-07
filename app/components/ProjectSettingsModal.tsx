'use client';

import { useState, useEffect, useCallback } from 'react';
import { Project } from '@/app/types';

interface Collaborator {
  id: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface ProjectSettingsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onProjectUpdate: (id: string, updates: Partial<Project>) => Promise<void>;
}

export default function ProjectSettingsModal({ project, isOpen, onClose, onProjectUpdate }: ProjectSettingsModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'EDITOR' | 'VIEWER'>('EDITOR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollaborators = useCallback(async () => {
    if (!project) return;
    try {
      const res = await fetch(`/api/projects/${project.id}`);
      if (res.ok) {
        const data = await res.json();
        setCollaborators(data.collaborators || []);
      }
    } catch (err) {
      console.error('Failed to fetch collaborators:', err);
    }
  }, [project]);

  useEffect(() => {
    if (project && isOpen) {
      setName(project.name);
      setDescription(project.description);
      fetchCollaborators();
    }
  }, [project, isOpen, fetchCollaborators]);

  const handleSave = async () => {
    if (!project) return;
    setLoading(true);
    setError(null);
    try {
      await onProjectUpdate(project.id, { name, description });
      fetchCollaborators();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollaborator = async () => {
    if (!project || !newEmail.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${project.id}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add collaborator');
      }
      setNewEmail('');
      fetchCollaborators();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add collaborator');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    if (!project) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${project.id}/collaborators?userId=${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove collaborator');
      fetchCollaborators();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove collaborator');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-[#E8E4DD] dark:border-[#3D3D3D]">
          <div>
            <h2 className="text-xl font-display font-semibold text-[#1A1A1A] dark:text-[#E8E6E3]">
              Project Settings
            </h2>
            <p className="text-sm text-[#8B8680] mt-1">
              Manage project details and collaborators
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

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E6E3] mb-3">
              Project Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#8B8680] mb-1">Project Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8B8680] mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="input-field resize-none"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E6E3] mb-3">
              Collaborators
            </h3>
            
            <div className="space-y-3 mb-4">
              {collaborators.length === 0 ? (
                <p className="text-sm text-[#8B8680]">No collaborators yet</p>
              ) : (
                collaborators.map((collab) => (
                  <div
                    key={collab.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E6E3] truncate">
                        {collab.user.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-[#8B8680] truncate">{collab.user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        collab.role === 'OWNER' 
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : collab.role === 'EDITOR'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400'
                      }`}>
                        {collab.role}
                      </span>
                      {collab.role !== 'OWNER' && (
                        <button
                          onClick={() => handleRemoveCollaborator(collab.user.id)}
                          className="p-1 text-[#8B8680] hover:text-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter user email..."
                className="input-field flex-1"
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'EDITOR' | 'VIEWER')}
                className="input-field w-24"
              >
                <option value="EDITOR">Editor</option>
                <option value="VIEWER">Viewer</option>
              </select>
              <button
                onClick={handleAddCollaborator}
                disabled={loading || !newEmail.trim()}
                className="btn-primary whitespace-nowrap"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-[#8B8680] mt-2">
              The user must sign in first before being added.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
