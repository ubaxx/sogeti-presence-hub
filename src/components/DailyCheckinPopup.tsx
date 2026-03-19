import { useEffect, useState } from "react";
import { usePresence } from "../hooks/usePresence";
import type { UserStatus } from "../data/mockUsers";

export default function DailyCheckinPopup() {
  const { updateStatus } = usePresence();

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastCheck = localStorage.getItem("lastCheckin");

    if (lastCheck !== today) {
      setVisible(true);
    }
  }, []);

  function handleSelect(status: UserStatus) {
    const today = new Date().toDateString();

    updateStatus(status);
    localStorage.setItem("lastCheckin", today);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Where are you working today?</h2>

        <div className="modal-buttons">
          <button onClick={() => handleSelect("office")}>Office</button>
          <button onClick={() => handleSelect("remote")}>Remote</button>
          <button onClick={() => handleSelect("client")}>Client</button>
        </div>
      </div>
    </div>
  );
}