import { useEffect, useState } from "react";
import { subscribeToast } from "../services/toastService";

type Toast = {
  id: string;
  message: string;
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    subscribeToast(setToasts);
  }, []);

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          {t.message}
        </div>
      ))}
    </div>
  );
}