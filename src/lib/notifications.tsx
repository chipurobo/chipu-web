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
  return (
    // Container is always rendered (even when empty) so screen readers
    // pick up the aria-live region immediately rather than mounting it
    // mid-announcement. The two live regions are separate so warnings
    // interrupt politely-queued info/success toasts.
    <>
      <div
        aria-live="polite"
        aria-atomic="false"
        aria-label="Notifications"
        className="fixed top-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] space-y-2 pointer-events-none"
      >
        {toasts.filter((t) => t.type !== 'warning').map((t) => renderToast(t, dismiss))}
      </div>
      <div
        aria-live="assertive"
        aria-atomic="false"
        aria-label="Alerts"
        role="region"
        className="fixed top-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] space-y-2 pointer-events-none"
      >
        {toasts.filter((t) => t.type === 'warning').map((t) => renderToast(t, dismiss))}
      </div>
    </>
  );
}

function renderToast(t: Toast, dismiss: (id: string) => void) {
  const Icon = ICONS[t.type];
  return (
    <div
      key={t.id}
      className={`pointer-events-auto rounded-md border-l-4 border-warm-200 shadow-md p-3 flex gap-2 ${STYLES[t.type]}`}
      // role on each toast so each is announced individually
      role={t.type === 'warning' ? 'alert' : 'status'}
    >
      <Icon
        aria-hidden="true"
        className={`h-4 w-4 mt-0.5 flex-shrink-0 ${ICON_COLORS[t.type]}`}
      />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm leading-snug">{t.title}</div>
        {t.body && <div className="text-xs text-gray-600 mt-0.5 leading-snug">{t.body}</div>}
      </div>
      <button
        type="button"
        onClick={() => dismiss(t.id)}
        className="text-gray-400 hover:text-gray-700 flex-shrink-0"
        aria-label={`Dismiss notification: ${t.title}`}
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
