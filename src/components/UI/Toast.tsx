import { useEffect, useState, useCallback } from 'react';

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 10);
    const hideTimer = setTimeout(() => handleClose(), duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, handleClose]);

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="flex items-center gap-3 bg-zinc-800 border border-red-700 text-red-400 px-5 py-3 rounded-xl shadow-2xl min-w-72 max-w-sm">
        <span className="text-lg">⚠️</span>
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={handleClose}
          className="ml-auto text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}