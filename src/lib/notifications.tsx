import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

// =============================================================
// Lightweight toast notifications for the dashboard.
//
// Wrap the dashboard tree in <NotificationsProvider>, drop a
// <NotificationToaster /> somewhere inside it, and call useNotifications()
// from any component to call notify('info' | 'success' | 'warning', ...).
// Toasts auto-dismiss after AUTO_DISMISS_MS.
// =============================================================

const AUTO_DISMISS_MS = 6000;

export type ToastType = 'info' | 'success' | 'warning';

interface Toast {
  id:    string;
  type:  ToastType;
  title: string;
  body?: string;
}

interface NotificationsState {
  toasts:  Toast[];
  notify:  (type: ToastType, title: string, body?: string) => void;
  dismiss: (id: string) => void;
}

const Ctx = createContext<NotificationsState | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback((type: ToastType, title: string, body?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((ts) => [...ts, { id, type, title, body }]);
    setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
  }, [dismiss]);

  return (
    <Ctx.Provider value={{ toasts, notify, dismiss }}>
      {children}
    </Ctx.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}

const ICONS: Record<ToastType, typeof Info> = {
  info:    Info,
  success: CheckCircle2,
  warning: AlertCircle,
};

const STYLES: Record<ToastType, string> = {
  info:    'border-teal-500 bg-white text-gray-900',
  success: 'border-emerald-500 bg-white text-gray-900',
  warning: 'border-amber-500 bg-white text-gray-900',
};

const ICON_COLORS: Record<ToastType, string> = {
  info:    'text-teal-600',
  success: 'text-emerald-600',
  warning: 'text-amber-600',
};

export function NotificationToaster() {
  const { toasts, dismiss } = useNotifications();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] space-y-2 pointer-events-none">
      {toasts.map((t) => {
        const Icon = ICONS[t.type];
        return (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-md border-l-4 border-warm-200 shadow-md p-3 flex gap-2 ${STYLES[t.type]}`}
            role="status"
          >
            <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${ICON_COLORS[t.type]}`} />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm leading-snug">{t.title}</div>
              {t.body && <div className="text-xs text-gray-600 mt-0.5 leading-snug">{t.body}</div>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-gray-400 hover:text-gray-700 flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
