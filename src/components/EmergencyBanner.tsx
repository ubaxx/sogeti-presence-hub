import { useEffect } from "react";
import { useEmergencyMode } from "../services/emergencyService";

export default function EmergencyBanner() {
  const { emergencyState, clearNotification } = useEmergencyMode();

  useEffect(() => {
    if (!emergencyState.lastNotification) return;

    const timer = window.setTimeout(() => {
      clearNotification();
    }, 6000);

    return () => window.clearTimeout(timer);
  }, [emergencyState.lastNotification, clearNotification]);

  if (!emergencyState.lastNotification) {
    return null;
  }

  return (
    <div className="emergency-banner">
      {emergencyState.lastNotification}
    </div>
  );
}