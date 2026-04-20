import { useState } from "react";
import { usePresence } from "../usePresence";
import { getCurrentUser } from "../../auth/authService";
import { dispatchScheduleChatReminder } from "../../../constants/presenceUiEvents";

export default function StatusUpdateBar() {
  const { users, updateStatus } = usePresence();
  const [showOfflinePrompt, setShowOfflinePrompt] = useState(false);

  const currentUser = getCurrentUser();
  const me = users.find((u) => u.id === currentUser.id);
  const currentStatus = me?.status;

  function handleOfflineChoice(mode: "offline" | "home") {
    const message =
      mode === "home"
        ? "You are going home and switched to Offline"
        : "You are stepping away and switched to Offline";

    updateStatus("offline", undefined, message);

    if (mode === "offline") {
      dispatchScheduleChatReminder();
    }

    setShowOfflinePrompt(false);
  }

  return (
    <>
      <div className="status-bar">
        <div className="status-bar-header">
          <div className="status-text">Where are you working today?</div>
          <div className="status-caption">Select your current workplace</div>
        </div>

        <div className="status-buttons">
          <button
            type="button"
            aria-pressed={currentStatus === "office"}
            className={`status-btn office ${currentStatus === "office" ? "active" : ""}`}
            onClick={() => updateStatus("office")}
          >
            Office
          </button>

          <button
            type="button"
            aria-pressed={currentStatus === "remote"}
            className={`status-btn remote ${currentStatus === "remote" ? "active" : ""}`}
            onClick={() => updateStatus("remote")}
          >
            Remote
          </button>

          <button
            type="button"
            aria-pressed={currentStatus === "client"}
            className={`status-btn client ${currentStatus === "client" ? "active" : ""}`}
            onClick={() => updateStatus("client")}
          >
            Client
          </button>

          <button
            type="button"
            aria-pressed={currentStatus === "offline"}
            className={`status-btn home ${currentStatus === "offline" ? "active" : ""}`}
            onClick={() => setShowOfflinePrompt(true)}
          >
            Offline
          </button>
        </div>
      </div>

      {showOfflinePrompt && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Going Offline</h2>
            <p className="status-confirm-text">
              Are you stepping away for a while, or are you going home?
            </p>

            <div className="modal-buttons status-confirm-buttons">
              <button
                type="button"
                onClick={() => handleOfflineChoice("offline")}
              >
                Just going offline
              </button>
              <button
                type="button"
                onClick={() => handleOfflineChoice("home")}
              >
                Going home
              </button>
            </div>

            <button
              type="button"
              className="status-confirm-cancel"
              onClick={() => setShowOfflinePrompt(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
