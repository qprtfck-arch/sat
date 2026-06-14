import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Icon from './Icon.jsx';

const ToastContext = createContext(null);

const TONE = {
  success: { icon: 'check-circle', cls: 'text-emerald-500' },
  error: { icon: 'alert-circle', cls: 'text-red-500' },
  info: { icon: 'sparkles', cls: 'text-brand-500' },
  coins: { icon: 'coins', cls: 'text-amber-500' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback(
    (message, tone = 'info', ttl = 3500) => {
      const id = ++idRef.current;
      setToasts((t) => [...t, { id, message, tone }]);
      setTimeout(() => dismiss(id), ttl);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-[min(92vw,360px)] flex-col gap-2"
        aria-live="polite"
        role="status"
      >
        {toasts.map((t) => {
          const tone = TONE[t.tone] || TONE.info;
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex animate-toast-in items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-card dark:border-slate-700 dark:bg-slate-900"
            >
              <span className={`mt-0.5 shrink-0 ${tone.cls}`}>
                <Icon name={tone.icon} size={18} />
              </span>
              <p className="flex-1 text-sm leading-snug">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Закрыть"
              >
                <Icon name="x" size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  return ctx || (() => {});
}
