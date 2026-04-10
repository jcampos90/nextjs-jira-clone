'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { File, FileImage, FileText, Download, Trash2, ExternalLink } from 'lucide-react';
import { Attachment } from '@/app/types';
import { useJira } from '@/app/context/JiraContext';

interface AttachmentListProps {
  ticketId: string;
  attachments: Attachment[];
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) {
    return <FileImage className="w-5 h-5 text-[#C4A35A]" />;
  }
  if (mimeType === 'application/pdf' || mimeType.includes('text')) {
    return <FileText className="w-5 h-5 text-[#8B8680]" />;
  }
  return <File className="w-5 h-5 text-[#8B8680]" />;
}

export default function AttachmentList({ ticketId: _ticketId, attachments }: AttachmentListProps) {
  const { deleteAttachment } = useJira();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadUrls, setDownloadUrls] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Fetch signed URLs for downloads
  useEffect(() => {
    async function fetchDownloadUrls() {
      const newUrls: Record<string, string> = {};
      for (const attachment of attachments) {
        try {
          const res = await fetch(`/api/attachments/${attachment.id}/download`);
          if (res.ok) {
            const data = await res.json();
            newUrls[attachment.id] = data.url;
          }
        } catch {
          // Silently fail for download URL fetch
        }
      }
      setDownloadUrls(newUrls);
    }

    if (attachments.length > 0) {
      fetchDownloadUrls();
    }
  }, [attachments]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm('Are you sure you want to delete this attachment?')) {
        return;
      }

      setDeletingId(id);
      setError(null);

      try {
        await deleteAttachment(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete attachment');
      } finally {
        setDeletingId(null);
      }
    },
    [deleteAttachment]
  );

  if (attachments.length === 0) {
    return (
      <p className="text-sm text-[#8B8680] italic py-2">No attachments yet</p>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <ul className="space-y-2" role="list">
        {attachments.map((attachment) => (
          <li
            key={attachment.id}
            className={`
              flex items-center gap-3 p-3 bg-white dark:bg-[#2A2A2A] border border-[#E8E4DD] dark:border-[#3D3D3D] rounded-md
              ${deletingId === attachment.id ? 'opacity-50' : ''}
            `}
          >
            <div className="flex-shrink-0">
              {getFileIcon(attachment.mimeType)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-medium text-[#2D2D2D] dark:text-[#E8E6E3] truncate"
                  title={attachment.filename}
                >
                  {attachment.filename.length > 30
                    ? `${attachment.filename.substring(0, 27)}...`
                    : attachment.filename}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#8B8680]">
                <span>{formatFileSize(attachment.size)}</span>
                <span>•</span>
                <span>{formatDate(attachment.createdAt)}</span>
                {attachment.uploadedBy && (
                  <>
                    <span>•</span>
                    <span>{attachment.uploadedBy.name || attachment.uploadedBy.email}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {downloadUrls[attachment.id] && (
                <a
                  href={downloadUrls[attachment.id]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-[#8B8680] hover:text-[#C4A35A] hover:bg-[#C4A35A]/10 rounded transition-colors"
                  title="Download"
                  aria-label={`Download ${attachment.filename}`}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <a
                href={downloadUrls[attachment.id] || '#'}
                download={attachment.filename}
                className="p-2 text-[#8B8680] hover:text-[#C4A35A] hover:bg-[#C4A35A]/10 rounded transition-colors"
                title="Save as"
                aria-label={`Save ${attachment.filename}`}
                onClick={(e) => {
                  if (!downloadUrls[attachment.id]) {
                    e.preventDefault();
                  }
                }}
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={() => handleDelete(attachment.id)}
                disabled={deletingId === attachment.id}
                className="p-2 text-[#8B8680] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                title="Delete"
                aria-label={`Delete ${attachment.filename}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
