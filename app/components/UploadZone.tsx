'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Attachment } from '@/app/types';
import { useJira } from '@/app/context/JiraContext';

interface UploadZoneProps {
  ticketId: string;
  onUploadComplete?: (attachment: Attachment) => void;
  acceptedTypes?: string;
  maxSizeMB?: number;
}

export default function UploadZone({
  ticketId,
  onUploadComplete,
  acceptedTypes = 'image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.zip',
  maxSizeMB = 10,
}: UploadZoneProps) {
  const { addAttachment } = useJira();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setSuccess(false);

      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File too large. Maximum size is ${maxSizeMB}MB.`);
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress (since fetch doesn't support upload progress natively without ReadableStream)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev === null || prev >= 90) return prev;
          return prev + 10;
        });
      }, 100);

      try {
        const attachment = await addAttachment(ticketId, file);
        setUploadProgress(100);
        setSuccess(true);
        onUploadComplete?.(attachment);

        // Reset success state after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        clearInterval(progressInterval);
        setIsUploading(false);
        setUploadProgress(null);
      }
    },
    [ticketId, addAttachment, maxSizeMB, onUploadComplete]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
      // Reset input so same file can be selected again
      e.target.value = '';
    },
    [handleFile]
  );

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
          ${isDragging
            ? 'border-[#C4A35A] bg-[#C4A35A]/5'
            : 'border-[#E8E4DD] dark:border-[#3D3D3D] bg-gray-50 dark:bg-[#2A2A2A] hover:bg-gray-100 dark:hover:bg-[#333333]'
          }
          ${isUploading ? 'pointer-events-none opacity-70' : ''}
        `}
        aria-label="Upload file"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />
        
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-8 h-8 text-[#8B8680]" />
          <p className="text-sm text-[#8B8680]">
            {isDragging ? (
              <span className="text-[#C4A35A] font-medium">Drop file here</span>
            ) : (
              <>
                <span className="font-medium text-[#2D2D2D] dark:text-[#E8E6E3]">Click to upload</span>
                {' or drag and drop'}
              </>
            )}
          </p>
          <p className="text-xs text-[#8B8680]">
            Max {maxSizeMB}MB
          </p>
        </div>
      </div>

      {isUploading && uploadProgress !== null && (
        <div className="relative h-1 bg-[#E8E4DD] dark:bg-[#3D3D3D] rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-[#C4A35A] transition-all duration-200"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
            aria-label="Dismiss error"
          >
            <X className="w-3 h-3 text-red-500" />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <p className="text-sm text-green-700 dark:text-green-400">File uploaded successfully</p>
        </div>
      )}
    </div>
  );
}
