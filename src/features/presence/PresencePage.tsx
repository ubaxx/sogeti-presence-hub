import { useEffect, useMemo, useState } from "react";

import "../../styles/dashboard.css";

import {
  applyPresenceUpdatedUser,
  usePresence
} from "./usePresence";
import { addActivity } from "../../services/activityStore";
import {
  clearEmergencyNotification,
  subscribeEmergency
} from "../emergency/emergencyService";
import { subscribeToPresenceUpdated } from "../../services/signalrPresence";
import { getAvatarProfile } from "../../services/avatarProfiles";
import StatusUpdateBar from "./components/StatusUpdateBar";
import ActivityFeed from "./components/ActivityFeed";
import EmergencyModal from "./components/EmergencyModal";

import { getCurrentUser } from "../auth/authService";
import {
  getPresenceInsights,
  type PresenceInsightWindow
} from "../../services/presenceInsights";
import {
  getWeeklyOfficeHistory,
  getWeekNumber
} from "../../services/presenceHistory";
import {
  PRESENCE_INSIGHT_WINDOWS,
  PRESENCE_STATUS_FILTERS,
  compareUsersForPresenceList,
  formatPresenceDelta,
  getColleagueActivityMessage,
  getPresenceDeltaClass
} from "./presencePageUtils";
import {
  loadPresenceViewPreferences,
  savePresenceViewPreferences,
  type PresenceViewPreferences
} from "./presenceViewPreferences";

import type { User, UserStatus } from "../../data/mockUsers";

export default function PresencePage() {
  const { users } = usePresence();
  const [filter, setFilter] = useState<UserStatus | "all">("all");
  const [emergency, setEmergency] = useState<number | null>(null);
  const [insightWindow, setInsightWindow] = useState<PresenceInsightWindow>(30);
  const [viewPreferences, setViewPreferences] = useState<PresenceViewPreferences>(
    () => loadPresenceViewPreferences()
  );
  const currentUser = getCurrentUser();

  useEffect(() => {
    savePresenceViewPreferences(viewPreferences);
  }, [viewPreferences]);

  useEffect(() => {
    const unsubscribe = subscribeEmergency((count) => {
      setEmergency(count);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let unsubscribeHub: (() => void) | undefined;

    void subscribeToPresenceUpdated((user) => {
      applyPresenceUpdatedUser({
        id: user.id,
        name: user.name,
        initials: user.initials,
        status: user.status,
        role: user.role
      });
    })
      .then((cleanup) => {
        unsubscribeHub = cleanup;
      })
      .catch((error) => {
        console.error("Failed to subscribe to presence updates", error);
      });

    return () => {
      unsubscribeHub?.();
    };
  }, []);

  useEffect(() => {
    let timeoutId: number | null = null;

    function scheduleColleagueActivity() {
      const currentUser = getCurrentUser();
      const colleagues = users.filter((user) => user.id !== currentUser.id);

      if (colleagues.length === 0) {
        return;
      }

      const randomUser =
        colleagues[Math.floor(Math.random() * colleagues.length)];
      addActivity(getColleagueActivityMessage(randomUser));

      timeoutId = window.setTimeout(scheduleColleagueActivity, 15_000);
    }

    timeoutId = window.setTimeout(scheduleColleagueActivity, 15_000);

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [users]);

  const counts = useMemo(
    () => ({
      office: users.filter((u: User) => u.status === "office").length,
      remote: users.filter((u: User) => u.status === "remote").length,
      client: users.filter((u: User) => u.status === "client").length,
      offline: users.filter((u: User) => u.status === "offline").length
    }),
    [users]
  );

  const insights = useMemo(
    () => getPresenceInsights(users, insightWindow),
    [users, insightWindow]
  );

  const visibleUsers = useMemo(() => {
    if (filter === "all") return users;
    return users.filter((u: User) => u.status === filter);
  }, [users, filter]);

  const sortedUsers = useMemo(() => {
    return [...visibleUsers].sort(compareUsersForPresenceList);
  }, [visibleUsers]);

  const weekNumber = getWeekNumber(new Date());
  const weekly = useMemo(() => getWeeklyOfficeHistory(), [users]);
  const currentUserStatus =
    users.find((user) => user.id === currentUser.id)?.status ?? "office";
  const officeUsers = useMemo(
    () => sortedUsers.filter((user) => user.status === "office"),
    [sortedUsers]
  );
  const otherVisibleUsers = useMemo(
    () => sortedUsers.filter((user) => user.status !== "office"),
    [sortedUsers]
  );

  function toggleViewPreference(key: keyof PresenceViewPreferences) {
    setViewPreferences((current) => ({
      ...current,
      [key]: !current[key]
    }));
  }

  return (
    <div className="presence-layout">
      {emergency && (
        <EmergencyModal
          count={emergency}
          onClose={() => {
            setEmergency(null);
            clearEmergencyNotification();
          }}
        />
      )}

      <div className="presence-main">
        <div className="presence-hero-card">
          <div className="presence-hero-copy">
            <div className="presence-hero-kicker">Workplace overview</div>
            <h1 className="page-title">Presence Overview</h1>
            <p className="presence-hero-description">
              Start with who is on site right now, then use the lighter insights below
              for planning and team awareness.
            </p>
            <div className="presence-page-toolbar">
              <div className="presence-page-meta">
                Week {weekNumber} | {insights.reportWindowLabel} | Last updated {insights.lastUpdatedLabel}
              </div>

              <div className="range-toggle" aria-label="Reporting window">
                {PRESENCE_INSIGHT_WINDOWS.map((windowOption) => (
                  <button
                    key={windowOption}
                    type="button"
                    className={insightWindow === windowOption ? "active" : ""}
                    onClick={() => setInsightWindow(windowOption)}
                  >
                    {windowOption} days
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={`presence-status-pill ${currentUserStatus}`}>
            {currentUserStatus}
          </div>
        </div>

        <StatusUpdateBar />

        {viewPreferences.showSummaryCards && (
          <div className="presence-summary-grid">
            <div className="summary-card">
              <div className="summary-eyebrow">On-site now</div>
              <div className="summary-value">{insights.officeNow}</div>
              <div className="summary-detail">{insights.occupancyRate}% occupancy rate</div>
            </div>

            <div className="summary-card">
              <div className="summary-eyebrow">{insightWindow}-day office average</div>
              <div className="summary-value">
                {insightWindow === 7 ? insights.averageOfficeLast7 : insights.averageOfficeLast30}
              </div>
              <div className="summary-detail">
                <span className={`summary-delta ${getPresenceDeltaClass(insights.weeklyChange)}`}>
                  {formatPresenceDelta(insights.weeklyChange)}
                </span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-eyebrow">Peak day</div>
              <div className="summary-value">{insights.peakOffice}</div>
              <div className="summary-detail">{insights.peakDayLabel}</div>
            </div>

            <div className="summary-card">
              <div className="summary-eyebrow">{insightWindow}-day remote average</div>
              <div className="summary-value">{insights.averageRemoteLast7}</div>
              <div className="summary-detail">
                Average remote attendance across the selected reporting window
              </div>
            </div>
          </div>
        )}

        <div className="chart-card presence-primary-card">
          <div className="card-header">
            <div>
              <h2>Who is in the office</h2>
              <span>Most relevant for a quick team scan</span>
            </div>
            <span>{officeUsers.length} on site right now</span>
          </div>

          <div className="office-list-grid office-list-grid-primary">
            {officeUsers.map((u: User) => {
              const avatarProfile = getAvatarProfile(u);

              return (
                <div key={u.id} className="office-list-user office-list-user-primary">
                  <div
                    className="office-avatar office-avatar-photo"
                    style={{
                      backgroundImage: `url("${avatarProfile.imageUrl}")`,
                      backgroundColor: "#ffffff"
                    }}
                    aria-label={`${u.name} profile avatar`}
                    title={u.name}
                  >
                    <span className="office-avatar-fallback">{u.initials}</span>
                  </div>
                  <div>
                    <div className="office-name">{u.name}</div>
                    <div className="office-status">{u.status}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {viewPreferences.showOtherStatuses && otherVisibleUsers.length > 0 && (
            <div className="presence-secondary-list">
              <div className="presence-secondary-list-header">
                <h3>Other team statuses</h3>
                <span>{filter === "all" ? "Remote, client and offline" : `Filtered by ${filter}`}</span>
              </div>

              <div className="office-list-grid">
                {otherVisibleUsers.map((u: User) => {
                  const avatarProfile = getAvatarProfile(u);

                  return (
                    <div key={u.id} className="office-list-user">
                      <div
                        className="office-avatar office-avatar-photo"
                        style={{
                          backgroundImage: `url("${avatarProfile.imageUrl}")`,
                          backgroundColor: "#ffffff"
                        }}
                        aria-label={`${u.name} profile avatar`}
                        title={u.name}
                      >
                        <span className="office-avatar-fallback">{u.initials}</span>
                      </div>
                      <div>
                        <div className="office-name">{u.name}</div>
                        <div className="office-status">{u.status}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {viewPreferences.showTeamSnapshot && (
          <section className="presence-secondary-section" aria-label="Additional team insights">
            <div className="presence-secondary-section-header">
              <div>
                <h2>Team snapshot</h2>
                <p>Supportive context for the day without overwhelming the main view.</p>
              </div>
            </div>

            <div className="presence-cards-grid presence-cards-grid-secondary">
              <div className="chart-card">
                <div className="card-header">
                  <h2>Daily status</h2>
                  <span>Current workforce mix</span>
                </div>

                <div className="daily-stats-grid">
                  {PRESENCE_STATUS_FILTERS.map((type) => (
                    <div
                      key={type}
                      className={`daily-stat ${type} ${filter === type ? "active" : ""}`}
                      onClick={() => setFilter(type)}
                    >
                      <span>{type}</span>
                      <strong>{counts[type]}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chart-card">
                <div className="card-header">
                  <h2>Weekly office pattern</h2>
                  <span>Latest office count per weekday</span>
                </div>
                {weekly.map((row) => (
                  <div key={row.dayLabel} className="weekly-row">
                    <span>{row.dayLabel}</span>
                    <strong>{row.office}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      <div className="presence-sidebar">
        <div className="presence-view-controls presence-view-controls-side">
          <div className="presence-view-controls-copy">
            <div className="presence-view-controls-title">View options</div>
            <div className="presence-view-controls-text">
              Choose the sections that matter most to you and keep the page calm.
            </div>
          </div>

          <div className="presence-view-toggle-group presence-view-toggle-group-side">
            <button
              type="button"
              className={`presence-view-toggle ${viewPreferences.showSummaryCards ? "active" : ""}`}
              onClick={() => toggleViewPreference("showSummaryCards")}
            >
              <span>Summary cards</span>
              <span>{viewPreferences.showSummaryCards ? "On" : "Off"}</span>
            </button>
            <button
              type="button"
              className={`presence-view-toggle ${viewPreferences.showOtherStatuses ? "active" : ""}`}
              onClick={() => toggleViewPreference("showOtherStatuses")}
            >
              <span>Other team statuses</span>
              <span>{viewPreferences.showOtherStatuses ? "On" : "Off"}</span>
            </button>
            <button
              type="button"
              className={`presence-view-toggle ${viewPreferences.showTeamSnapshot ? "active" : ""}`}
              onClick={() => toggleViewPreference("showTeamSnapshot")}
            >
              <span>Team snapshot</span>
              <span>{viewPreferences.showTeamSnapshot ? "On" : "Off"}</span>
            </button>
            <button
              type="button"
              className={`presence-view-toggle ${viewPreferences.showActivityFeed ? "active" : ""}`}
              onClick={() => toggleViewPreference("showActivityFeed")}
            >
              <span>Live feed</span>
              <span>{viewPreferences.showActivityFeed ? "On" : "Off"}</span>
            </button>
          </div>
        </div>

        {viewPreferences.showActivityFeed && (
          <ActivityFeed />
        )}
      </div>
    </div>
  );
}
