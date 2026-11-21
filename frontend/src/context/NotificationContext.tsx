import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface NotificationContextType {
  notify: (message: string, type?: ToastType) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notify: () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getToastBadge = (type: ToastType) => {
    switch (type) {
      case 'error':
        return {
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          boxClass: 'bg-rose-500/15 text-rose-400 border border-rose-500/25',
          borderClass: 'border-rose-500/30',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          boxClass: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
          borderClass: 'border-amber-500/30',
        };
      case 'info':
        return {
          icon: <Info className="w-3.5 h-3.5" />,
          boxClass: 'bg-sky-500/15 text-sky-400 border border-sky-500/25',
          borderClass: 'border-sky-500/30',
        };
      case 'success':
      default:
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          boxClass: 'bg-[#D97757]/15 text-[#D97757] border border-[#D97757]/30',
          borderClass: 'border-[#3E3E38]',
        };
    }
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {/* Toast notifications container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          const badge = getToastBadge(toast.type);

          return (
            <div
              key={toast.id}
              role="status"
              className={cn(
                'pointer-events-auto flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-[#1C1C1B]/95 backdrop-blur-md border shadow-[0_8px_30px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.06)] text-xs text-[#FAF9F5] font-medium transition-all duration-200 animate-in fade-in slide-in-from-bottom-3',
                badge.borderClass
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className={cn('w-5 h-5 rounded-full flex items-center justify-center shrink-0', badge.boxClass)}>
                  {badge.icon}
                </div>
                <span className="truncate leading-tight text-neutral-200">{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-neutral-500 hover:text-white p-1 rounded hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
