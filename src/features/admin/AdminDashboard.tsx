import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { usePresence } from "../presence/usePresence";
import { exportPresencePDF } from "../reports/services/exportPDF";
import { exportEmergencyPDF } from "../reports/services/exportEmergencyPDF";
import { getCurrentRole, getCurrentUser } from "../auth/authService";
import {
  recordAdminAction,
  recordEmergencyAlert
} from "./adminBackendService";
import { getAvatarProfile } from "../../services/avatarProfiles";
import { triggerEmergency as broadcastEmergency } from "../emergency/emergencyService";
import { getPresenceInsights } from "../../services/presenceInsights";
import {
  getMonthlyOfficeHistory
} from "../../services/presenceHistory";
import { showToast } from "../../services/toastService";
import type { UserStatus } from "../../data/mockUsers";
import LoginModal from "../../components/LoginModal";
import {
  buildStatusDistribution,
  createAdminActionItem,
  formatAdminDelta,
  getAdminDeltaClass,
  getMonthlyInsight,
  type AdminActionItem
} from "./adminDashboardUtils";
import "../../styles/dashboard.css";
import "../../styles/admin-dashboard.css";

export default function AdminDashboard() {
  const { users, toggleRole } = usePresence();
  const role = getCurrentRole();
  const currentUser = getCurrentUser();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const [showEmergencySent, setShowEmergencySent] = useState(false);
  const [emergencySentAt, setEmergencySentAt] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [recentActions, setRecentActions] = useState<AdminActionItem[]>([
    createAdminActionItem(
      "Dashboard ready",
      "Admin controls and emergency actions are available."
    )
  ]);

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
  const insights = useMemo(() => getPresenceInsights(users), [users]);
  const monthly = useMemo(() => getMonthlyOfficeHistory(), [users]);
  const monthlyInsight = useMemo(() => getMonthlyInsight(monthly), [monthly]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (search && !u.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [users, search, statusFilter]);

  function triggerEmergency() {
    const inOffice = users.filter((u) => u.status === "office");
    broadcastEmergency(inOffice.length);
    void recordEmergencyAlert({
      recipientCount: inOffice.length,
      message: "Emergency alert sent to everyone currently in the building.",
      triggeredByUserId: currentUser.id,
      triggeredByName: currentUser.name
    }).catch((error) => {
      console.error("Failed to record emergency alert", error);
    });

    showToast("Emergency triggered");

    setTimeout(() => {
      showToast(`Alert sent to ${inOffice.length} people`);
    }, 1500);
  }

  const emergencyRecipients = stats.office;
  const totalUsers = users.length || 1;
  const distributionData = buildStatusDistribution(users);
  const monthlyChartData = monthly.map((item) => ({
    ...item,
    fill:
      item.office === monthlyInsight.peakWeekValue
        ? "#6264A7"
        : "rgba(98, 100, 167, 0.45)"
  }));

  function addRecentAction(title: string, detail: string) {
    const nextItem = createAdminActionItem(title, detail);

    setRecentActions((current) => [nextItem, ...current].slice(0, 6));
  }

  function handleToggleRole(userId: string) {
    const targetUser = users.find((user) => user.id === userId);

    if (
      targetUser?.role === "admin" &&
      targetUser.id === currentUser.id &&
      stats.admins === 1
    ) {
      showToast("At least one admin must remain");
      return;
    }

    toggleRole(userId);

    if (targetUser) {
      void recordAdminAction({
        actionType: targetUser.role === "admin" ? "remove_admin" : "grant_admin",
        title:
          targetUser.role === "admin"
            ? "Admin access removed"
            : "Admin access granted",
        detail: `${targetUser.name} is now ${targetUser.role === "admin" ? "a user" : "an admin"}.`,
        actorUserId: currentUser.id,
        actorName: currentUser.name
      }).catch((error) => {
        console.error("Failed to record admin action", error);
      });

      addRecentAction(
        targetUser.role === "admin" ? "Admin access removed" : "Admin access granted",
        `${targetUser.name} is now ${targetUser.role === "admin" ? "a user" : "an admin"}.`
      );
    }
  }

  if (role !== "admin") {
    return (
      <>
        <div className="admin-denied">
          <h2 className="admin-section-title">Admin access required</h2>
          <p className="admin-helper">
            Sign in with an admin account to open the dashboard and emergency tools.
          </p>
          <button
            type="button"
            className="admin-secondary-action"
            onClick={() => setShowLoginModal(true)}
          >
            Sign in as admin
          </button>
        </div>

        {showLoginModal && (
          <LoginModal onClose={() => setShowLoginModal(false)} />
        )}
      </>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">
            Emergency handling and user administration first, with planning insights kept
            secondary.
          </p>
        </div>

        <div className="admin-actions">
          <button type="button" onClick={() => exportPresencePDF(users)}>
            Manager PDF
          </button>

          <button type="button" onClick={() => exportEmergencyPDF(users)}>
            Emergency PDF
          </button>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-section-header">
          <div>
            <h3 className="admin-section-title">Emergency Alert</h3>
            <p className="admin-section-subtitle">
              Send a Teams alert to everyone currently registered in the building.
            </p>
          </div>
          <span className="admin-emergency-status">Ready</span>
        </div>

        <div className="admin-emergency-panel">
          <div className="admin-emergency-panel-copy">
            <span className="admin-emergency-label">Recipients in building</span>
            <strong>{emergencyRecipients}</strong>
            <span className="admin-emergency-note">
              Users currently marked as Office will receive the alert in Teams.
            </span>

            <div className="admin-emergency-meta">
              <span className="admin-emergency-meta-pill">
                Teams delivery ready
              </span>
              <span className="admin-emergency-meta-pill">
                Updated {insights.lastUpdatedLabel}
              </span>
              {emergencySentAt && (
                <span className="admin-emergency-meta-pill">
                  Last alert {emergencySentAt}
                </span>
              )}
            </div>
          </div>

          <div className="admin-emergency-actions">
            <button
              type="button"
              className="danger admin-emergency-action"
              onClick={() => setShowEmergencyConfirm(true)}
            >
              Send Alert To Building
            </button>
            <div className="admin-emergency-caption">
              Use this when everyone currently on site needs an immediate Teams notification.
            </div>
          </div>
        </div>
      </div>

      <div className="admin-kpi-grid">
        <div className="admin-card admin-kpi-card insight">
          <span>On-site now</span>
          <strong>{insights.officeNow}</strong>
        </div>
        <div className="admin-card admin-kpi-card insight">
          <span>7-day office average</span>
          <strong>{insights.averageOfficeLast7}</strong>
        </div>
        <div className="admin-card admin-kpi-card insight">
          <span>Weekly change</span>
          <strong>{insights.weeklyChange > 0 ? `+${insights.weeklyChange}` : insights.weeklyChange}</strong>
        </div>
        <div className="admin-card admin-kpi-card insight">
          <span>Peak day</span>
          <strong>{insights.peakDayLabel}</strong>
        </div>
        <div className="admin-card admin-kpi-card insight">
          <span>Occupancy rate</span>
          <strong>{insights.occupancyRate}%</strong>
        </div>
      </div>

      <div className="admin-analytics-grid">
        <div className="admin-card admin-insights-card">
          <div className="admin-section-header">
            <div>
              <h3 className="admin-section-title">Operational Summary</h3>
              <p className="admin-section-subtitle">
                A calm overview of attendance signals and workforce balance.
              </p>
            </div>
          </div>

          <div className="admin-summary-grid">
            <div className="admin-summary-item office">
              <span>Office</span>
              <strong>{stats.office}</strong>
            </div>
            <div className="admin-summary-item remote">
              <span>Remote</span>
              <strong>{stats.remote}</strong>
            </div>
            <div className="admin-summary-item client">
              <span>Client</span>
              <strong>{stats.client}</strong>
            </div>
            <div className="admin-summary-item offline">
              <span>Offline</span>
              <strong>{stats.offline}</strong>
            </div>
            <div className="admin-summary-item admin">
              <span>Admins</span>
              <strong>{stats.admins}</strong>
            </div>
          </div>

          <p className="admin-helper">
            Report window: {insights.reportWindowLabel}. Last updated: {insights.lastUpdatedLabel}.
            Peak office day was {insights.peakDayLabel} with {insights.peakOffice} people on site.
          </p>
          <p className={`admin-delta ${getAdminDeltaClass(insights.weeklyChange)}`}>
            {formatAdminDelta(insights.weeklyChange)}
          </p>
        </div>

        <div className="admin-card">
          <div className="card-header">
            <h2>Monthly trend</h2>
            <span>Office attendance across recent weeks</span>
          </div>

          <div className="trend-summary-row">
            <div className="trend-summary-item">
              <span className="trend-summary-label">Peak week</span>
              <strong>{monthlyInsight.peakWeekLabel}</strong>
              <span className="trend-summary-detail">
                {monthlyInsight.peakWeekValue} people on site
              </span>
            </div>
            <div className="trend-summary-item">
              <span className="trend-summary-label">Lowest week</span>
              <strong>{monthlyInsight.lowWeekLabel}</strong>
              <span className="trend-summary-detail">
                {monthlyInsight.lowWeekValue} people on site
              </span>
            </div>
            <div className="trend-summary-item">
              <span className="trend-summary-label">Latest movement</span>
              <strong>
                {monthlyInsight.delta > 0
                  ? `+${monthlyInsight.delta}`
                  : monthlyInsight.delta}
              </strong>
              <span className="trend-summary-detail">
                Compared with the previous week
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="weekLabel" />
              <YAxis
                label={{ value: "On site", angle: -90, position: "insideLeft" }}
              />
              <Tooltip />
              <Bar dataKey="office" radius={[8, 8, 0, 0]}>
                {monthlyChartData.map((entry) => (
                  <Cell key={entry.weekLabel} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="office"
                  position="top"
                  className="trend-bar-label"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <p className="trend-insight-text">
            {monthlyInsight.peakWeekLabel === "No data"
              ? "Attendance history will appear here as soon as more weekly data is recorded."
              : `${monthlyInsight.peakWeekLabel} was the busiest week this month, while ${monthlyInsight.lowWeekLabel} had the lightest office attendance.`}
          </p>
        </div>

        <div className="admin-card">
          <div className="card-header">
            <h2>Status distribution</h2>
            <span>Current workplace split across the team</span>
          </div>

          <div className="distribution-total">
            <span className="distribution-total-label">Total active users</span>
            <strong>{users.length}</strong>
          </div>

          <div className="distribution-bar" aria-label="Status distribution">
            {distributionData.map((entry) => (
              <div
                key={entry.key}
                className={`distribution-segment ${entry.key}`}
                style={{ width: `${(entry.value / totalUsers) * 100}%` }}
                title={`${entry.name}: ${entry.value}`}
              />
            ))}
          </div>

          <div className="distribution-list">
            {distributionData.map((entry) => (
              <div key={entry.key} className="distribution-item">
                <div className="distribution-item-meta">
                  <span
                    className="distribution-dot"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="distribution-name">{entry.name}</span>
                </div>
                <div className="distribution-values">
                  <strong>{entry.value}</strong>
                  <span>{Math.round((entry.value / totalUsers) * 100)}%</span>
                </div>
              </div>
            ))}
          </div>

          <p className="trend-insight-text">
            {`${Math.round((stats.office / totalUsers) * 100)}% on site, ${Math.round((stats.remote / totalUsers) * 100)}% remote, ${Math.round((stats.client / totalUsers) * 100)}% client, and ${Math.round((stats.offline / totalUsers) * 100)}% offline right now.`}
          </p>
        </div>
      </div>

      <div className="admin-layout-grid">
        <div className="admin-card admin-user-card">
          <div className="admin-section-header">
            <div>
              <h3 className="admin-section-title">User Management</h3>
              <p className="admin-section-subtitle">
                Review workforce status and manage admin permissions.
              </p>
            </div>
            <div className="admin-table-summary">
              <span className="admin-table-summary-pill">
                {filtered.length} visible
              </span>
            </div>
          </div>

          <div className="admin-filters">
            <input
              placeholder="Search user"
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

          <div className="admin-table">
            <div className="admin-row admin-head">
              <span>Name</span>
              <span>Status</span>
              <span>Role</span>
              <span>Action</span>
            </div>

            {filtered.map((u) => {
              const avatarProfile = getAvatarProfile(u);

              return (
                <div key={u.id} className="admin-row">
                  <div className="admin-user-cell">
                    <div
                      className="admin-user-avatar"
                      style={{
                        backgroundImage: `url("${avatarProfile.imageUrl}")`,
                        backgroundColor: "#ffffff"
                      }}
                      aria-label={`${u.name} profile avatar`}
                      title={u.name}
                    >
                      <span className="admin-user-avatar-fallback">{u.initials}</span>
                    </div>

                    <div className="admin-user-meta">
                      <span className="admin-user-name">{u.name}</span>
                      <span className="admin-user-caption">
                        {u.id === currentUser.id ? "Current signed-in user" : "Presence participant"}
                      </span>
                    </div>
                  </div>
                  <span className={`admin-badge status ${u.status}`}>{u.status}</span>
                  <span className={`admin-badge role ${u.role}`}>{u.role}</span>

                  <button
                    type="button"
                    className={u.role === "admin" ? "remove" : ""}
                    disabled={
                      u.role === "admin" &&
                      u.id === currentUser.id &&
                      stats.admins === 1
                    }
                    title={
                      u.role === "admin" &&
                      u.id === currentUser.id &&
                      stats.admins === 1
                        ? "At least one admin must remain"
                        : undefined
                    }
                    onClick={() => handleToggleRole(u.id)}
                  >
                    {u.role === "admin" ? "Remove Admin" : "Make Admin"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="admin-card admin-actions-card">
          <div className="admin-section-header">
            <div>
              <h3 className="admin-section-title">Recent Admin Actions</h3>
              <p className="admin-section-subtitle">
                Track the latest access and emergency activity.
              </p>
            </div>
          </div>

          <div className="admin-action-list">
            {recentActions.map((action) => (
              <div key={action.id} className="admin-action-item">
                <div className="admin-action-marker" />
                <div className="admin-action-copy">
                  <div className="admin-action-topline">
                    <strong>{action.title}</strong>
                    <span>{action.time}</span>
                  </div>
                  <p>{action.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showEmergencyConfirm && (
        <div className="modal-overlay">
          <div className="modal admin-emergency-confirm">
            <h2>Send Emergency Alert</h2>
            <p className="status-confirm-text">
              Are you sure you want to send a Teams emergency alert to{" "}
              {emergencyRecipients} people currently marked in the building?
            </p>

            <div className="modal-buttons status-confirm-buttons">
              <button
                type="button"
                onClick={() => {
                  triggerEmergency();
                  setShowEmergencyConfirm(false);
                  setEmergencySentAt(new Date().toLocaleString());
                  addRecentAction(
                    "Emergency alert sent",
                    `Teams emergency notification sent to ${emergencyRecipients} people in the building.`
                  );
                  setShowEmergencySent(true);
                }}
              >
                Confirm alert
              </button>
              <button
                type="button"
                className="admin-secondary-action"
                onClick={() => setShowEmergencyConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showEmergencySent && (
        <div className="modal-overlay">
          <div className="modal admin-emergency-confirm admin-emergency-success">
            <h2>Emergency Alert Sent</h2>
            <p className="status-confirm-text">
              A Teams emergency notification has been sent to everyone currently
              marked as being in the office.
            </p>
            <p className="admin-emergency-success-count">
              Recipients: {emergencyRecipients}
            </p>
            <p className="admin-emergency-success-time">
              Sent: {emergencySentAt}
            </p>

            <div className="modal-buttons status-confirm-buttons">
              <button
                type="button"
                onClick={() => setShowEmergencySent(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
