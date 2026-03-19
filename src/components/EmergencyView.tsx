import { usePresence } from "../hooks/usePresence";
import { exportEmergencyPDF } from "../services/exportEmergencyPDF";

export default function EmergencyView() {
  const { users } = usePresence();

  const inOffice = users.filter((u) => u.status === "office");

  return (
    <div className="chart-card">
      <div className="card-header">
        <h2>Emergency View</h2>
        <button className="admin-btn" onClick={() => exportEmergencyPDF(users)}>
          Export Emergency PDF
        </button>
      </div>

      <div className="office-list-grid">
        {inOffice.map((u) => (
          <div key={u.id} className="office-list-user">
            <div className="office-avatar">{u.initials}</div>
            <div>
              <div className="office-name">{u.name}</div>
              <div className="office-status">In office</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}