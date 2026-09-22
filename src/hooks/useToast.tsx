import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/utils/cn';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => remove(id), 3500);
  }, [remove]);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-success-600" />,
    error: <XCircle className="h-5 w-5 text-error-600" />,
    info: <Info className="h-5 w-5 text-primary-600" />,
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
<<<<<<< HEAD
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-[100] flex flex-col gap-3">
=======
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
>>>>>>> 5659604fc572f48fdc5ffb0a48e7a78db09dad67
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-card-hover border border-gray-100 min-w-[280px] max-w-sm',
              'animate-in slide-in-from-right'
            )}
          >
            {icons[t.type]}
            <span className="text-sm font-medium text-gray-800 flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
