import { useMemo, useState } from "react";
import { usePresence } from "../hooks/usePresence";
import { exportPresencePDF } from "../services/exportPDF";
import { exportEmergencyPDF } from "../services/exportEmergencyPDF";
import { getCurrentRole } from "../services/authService";
import { showToast } from "../services/toastService";
import type { UserStatus } from "../data/mockUsers";
import "../styles/admin-dashboard.css";

export default function AdminDashboard() {
  const { users, toggleRole } = usePresence();
  const role = getCurrentRole();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");

  // =====================
  // STATS
  // =====================
  const stats = useMemo(
    () => ({
      office: users.filter((u) => u.status === "office").length,
      remote: users.filter((u) => u.status === "remote").length,
      client: users.filter((u) => u.status === "client").length,
      offline: users.filter((u) => u.status === "offline").length,
      admins: users.filter((u) => u.role === "admin").length
    }),
    [users]
  );

  // =====================
  // FILTER
  // =====================
  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (search && !u.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [users, search, statusFilter]);

  // =====================
  // EMERGENCY
  // =====================
  function triggerEmergency() {
    const inOffice = users.filter((u) => u.status === "office");

    showToast("🚨 Emergency triggered");

    setTimeout(() => {
      showToast(`📢 Alert sent to ${inOffice.length} people`);
    }, 1500);
  }

  const bannerClass =
    stats.office > 10
      ? "admin-emergency-banner high"
      : "admin-emergency-banner low";

  if (role !== "admin") {
    return <div className="admin-denied">Access denied</div>;
  }

  return (
    <div className="admin-page">
      {/* HEADER */}
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">
            Office analytics, emergency tools and user control
          </p>
        </div>

        <div className="admin-actions">
          <button onClick={() => exportPresencePDF(users)}>
            Manager PDF
          </button>

          <button onClick={() => exportEmergencyPDF(users)}>
            Emergency PDF
          </button>
        </div>
      </div>

      {/* EMERGENCY */}
      {stats.office > 0 && (
        <div className={bannerClass}>
          👥 {stats.office} people currently in the office
        </div>
      )}

      {/* KPI */}
      <div className="admin-kpi-grid">
        <div className="admin-card">
          <span>Office</span>
          <strong>{stats.office}</strong>
        </div>
        <div className="admin-card">
          <span>Remote</span>
          <strong>{stats.remote}</strong>
        </div>
        <div className="admin-card">
          <span>Client</span>
          <strong>{stats.client}</strong>
        </div>
        <div className="admin-card">
          <span>Offline</span>
          <strong>{stats.offline}</strong>
        </div>
        <div className="admin-card">
          <span>Admins</span>
          <strong>{stats.admins}</strong>
        </div>
      </div>

      {/* FILTER */}
      <div className="admin-card">
        <h3>Filters</h3>

        <div className="admin-filters">
          <input
            placeholder="Search user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            aria-label="Filter users by status"
            title="Filter users by status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as UserStatus | "all")
            }
          >
            <option value="all">All</option>
            <option value="office">Office</option>
            <option value="remote">Remote</option>
            <option value="client">Client</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* USERS */}
      <div className="admin-card">
        <h3>Users ({filtered.length})</h3>

        <div className="admin-table">
          <div className="admin-row admin-head">
            <span>Name</span>
            <span>Status</span>
            <span>Role</span>
            <span>Action</span>
          </div>

          {filtered.map((u) => (
            <div key={u.id} className="admin-row">
              <span>{u.name}</span>
              <span>{u.status}</span>
              <span>{u.role}</span>

              <button
                className={u.role === "admin" ? "remove" : ""}
                onClick={() => toggleRole(u.id)}
              >
                {u.role === "admin" ? "Remove Admin" : "Make Admin"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* EMERGENCY */}
      <div className="admin-card">
        <h3>Emergency</h3>

        <p className="admin-helper">
          Trigger alert to everyone currently in the office
        </p>

        <button className="danger" onClick={triggerEmergency}>
          Trigger Emergency
        </button>
      </div>
    </div>
  );
}