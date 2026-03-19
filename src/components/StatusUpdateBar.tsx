import { usePresence } from "../hooks/usePresence";
import { getCurrentUser } from "../services/authService";

export default function StatusUpdateBar() {
  const { users, updateStatus } = usePresence();

  const currentUser = getCurrentUser();
  const me = users.find((u) => u.id === currentUser.id);

  const currentStatus = me?.status;

  return (
    <div className="status-bar">
      <div className="status-text">
        Where are you working today?
      </div>

      <div className="status-buttons">
        <button
          className={`status-btn office ${currentStatus === "office" ? "active" : ""}`}
          onClick={() => updateStatus("office")}
        >
          🏢 Office
        </button>

        <button
          className={`status-btn remote ${currentStatus === "remote" ? "active" : ""}`}
          onClick={() => updateStatus("remote")}
        >
          🏠 Remote
        </button>

        <button
          className={`status-btn client ${currentStatus === "client" ? "active" : ""}`}
          onClick={() => updateStatus("client")}
        >
          💼 Client
        </button>

        <button
          className={`status-btn home ${currentStatus === "offline" ? "active" : ""}`}
          onClick={() => updateStatus("offline")}
        >
          🚪 Go home
        </button>
      </div>
    </div>
  );
}