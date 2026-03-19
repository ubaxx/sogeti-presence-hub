import { useEffect } from "react";

type Props = {
  count: number;
  onClose: () => void;
};

export default function EmergencyModal({ count, onClose }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="emergency-modal">
      <div className="emergency-modal-content">
        <h3>🚨 Emergency Alert</h3>
        <p>{count} people currently in the office</p>

        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
}