'use client';

import { STATUS_ORDER, STATUS_CONFIG } from '@/app/types';

function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse-skeleton">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
      <div className="h-5 w-full bg-slate-200 dark:bg-slate-700 rounded mb-2" />
      <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="h-5 w-14 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
      <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="h-3 w-14 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  );
}

export default function TaskLoader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      {STATUS_ORDER.map((status, colIndex) => (
        <div 
          key={status} 
          className="animate-fade-in"
          style={{ animationDelay: `${colIndex * 0.05}s` }}
        >
          <div className="column-header mb-4">
            <h2 className="font-display font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[status].dot}`} />
              {STATUS_CONFIG[status].label}
            </h2>
            <div className="h-5 w-6 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
          <div className="space-y-4 min-h-[300px] pb-4">
            {[0, 1, 2].map((cardIndex) => (
              <div 
                key={cardIndex} 
                className="animate-slide-up"
                style={{ animationDelay: `${colIndex * 0.05 + cardIndex * 0.08}s` }}
              >
                <SkeletonCard />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
