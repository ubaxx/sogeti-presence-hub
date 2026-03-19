import { usePresence } from "../hooks/usePresence";
import "../styles/teams.css";

export default function Admin() {
  const { users } = usePresence();

  const offlineUsers = users.filter(
    (u) => u.status === "offline"
  );

  return (
    <div className="teams-page">
      <div className="teams-card">
        <h2>Admin View</h2>

        <p>{offlineUsers.length} users not checked in</p>

        {offlineUsers.map((u) => (
          <div key={u.id}>
            {u.name} - {u.team}
          </div>
        ))}
      </div>
    </div>
  );
}