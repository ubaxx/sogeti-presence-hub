import { useEffect } from "react";

type Props = {
  count: number;
  onClose: () => void;
};

export default function EmergencyModal({ count, onClose }: Props) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onClose();
    }, 7000);

    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="modal-overlay">
      <div className="modal emergency-alert-modal">
        <div className="emergency-alert-badge">Emergency alert</div>
        <h2>Evacuate the building</h2>
        <p className="emergency-alert-text">
          An emergency Teams notification has been issued for everyone currently
          marked as being on site.
        </p>

        <div className="emergency-alert-stats">
          <div className="emergency-alert-stat">
            <span className="emergency-alert-label">People in office</span>
            <strong>{count}</strong>
          </div>
          <div className="emergency-alert-stat">
            <span className="emergency-alert-label">Recommended action</span>
            <strong>Leave immediately</strong>
          </div>
        </div>

        <div className="emergency-alert-note">
          Proceed to the nearest exit and wait for further instructions from
          your building coordinator.
        </div>

        <div className="modal-buttons status-confirm-buttons">
          <button type="button" onClick={onClose}>
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
