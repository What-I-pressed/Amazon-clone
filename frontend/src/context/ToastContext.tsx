import { createContext, ReactNode, useContext, useMemo, useState } from "react";

interface Toast {
  id: number;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string) => {
    if (!message) return;
    const toast: Toast = {
      id: Date.now() + Math.random(),
      message,
    };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== toast.id));
    }, 2200);
  };

  const value = useMemo(() => ({ showToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <style>
        {`
          @keyframes toast-fade-cycle {
            0% { opacity: 0; transform: translateY(-8px); }
            15% { opacity: 0.5; transform: translateY(0); }
            85% { opacity: 0.5; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-6px); }
          }
        `}
      </style>
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-none select-none rounded-md bg-black/85 text-white px-4 py-2 text-sm font-normal shadow-lg"
            style={{
              animation: "toast-fade-cycle 2200ms ease-in-out forwards",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
