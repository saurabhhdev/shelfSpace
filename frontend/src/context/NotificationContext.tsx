import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface NotificationContextType {
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notify: () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-center justify-between gap-3 p-3 rounded-md bg-[#16171b] border border-white/[0.08] shadow-lg text-xs transition-all duration-150 animate-in fade-in slide-in-from-bottom-2',
              toast.type === 'error' && 'border-rose-900/40 text-rose-300',
              toast.type === 'success' && 'text-[#E5E5E5]'
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              {toast.type === 'error' ? (
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#09AE5B] shrink-0" />
              )}
              <span className="truncate">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-neutral-500 hover:text-white p-0.5 cursor-pointer shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
