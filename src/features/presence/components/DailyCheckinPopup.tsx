import { useEffect, useState } from "react";
import { usePresence } from "../usePresence";
import type { UserStatus } from "../../../data/mockUsers";
import {
  OPEN_CHECKIN_EVENT,
  dispatchCheckinUpdated
} from "../../../constants/presenceUiEvents";
const checkinOptions: Array<{
  status: UserStatus;
  title: string;
  description: string;
}> = [
  {
    status: "office",
    title: "Office",
    description: "You are on site and available in the building."
  },
  {
    status: "remote",
    title: "Remote",
    description: "You are working from home or another remote location."
  },
  {
    status: "client",
    title: "Client",
    description: "You are spending the day with a client."
  }
];

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

  useEffect(() => {
    function handleOpenCheckin() {
      setVisible(true);
    }

    window.addEventListener(OPEN_CHECKIN_EVENT, handleOpenCheckin);
    return () => {
      window.removeEventListener(OPEN_CHECKIN_EVENT, handleOpenCheckin);
    };
  }, []);

  function handleSelect(status: UserStatus) {
    const today = new Date().toDateString();

    updateStatus(status);
    localStorage.setItem("lastCheckin", today);
    dispatchCheckinUpdated();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal daily-checkin-modal">
        <div className="daily-checkin-badge">Daily check-in</div>
        <h2>Where are you working today?</h2>
        <p className="daily-checkin-text">
          Update your status once so your team gets the latest workplace view.
        </p>

        <div className="daily-checkin-options">
          {checkinOptions.map((option) => (
            <button
              key={option.status}
              type="button"
              className={`daily-checkin-option ${option.status}`}
              onClick={() => handleSelect(option.status)}
            >
              <span className="daily-checkin-option-title">
                {option.title}
              </span>
              <span className="daily-checkin-option-text">
                {option.description}
              </span>
            </button>
          ))}
        </div>

        <div className="daily-checkin-footer">
          You can update your status again at any time from the presence bar.
        </div>
      </div>
    </div>
  );
}
