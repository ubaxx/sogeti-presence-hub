import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

import "../styles/dashboard.css";

import { usePresence } from "../hooks/usePresence";
import { subscribeEmergency } from "../services/emergencyService";
import StatusUpdateBar from "../components/StatusUpdateBar";
import ActivityFeed from "../components/ActivityFeed";
import DailyCheckinPopup from "../components/DailyCheckinPopup";
import EmergencyModal from "../components/EmergencyModal";

import { addActivity } from "../services/activityStore";
import { getCurrentUser } from "../services/authService";

import {
  getWeeklyOfficeHistory,
  getMonthlyOfficeHistory,
  getWeekNumber
} from "../services/presenceHistory";

import type { User, UserStatus } from "../data/mockUsers";

export default function PresencePage() {
  const { users, updateStatus } = usePresence();
  const [filter, setFilter] = useState<UserStatus | "all">("all");

 // ENDAST DETTA BLOCK ERSÄTT DIN EMERGENCY DEL MED:

const [emergency, setEmergency] = useState<number | null>(null);

useEffect(() => {
  const unsubscribe = subscribeEmergency((count) => {
    console.log("🚨 Received emergency:", count);

    const me = getCurrentUser();

    // 🔥 viktig fix: fallback om status saknas
    if (!me || me.status === "office") {
      setEmergency(count);
    }
  });

  return unsubscribe;
}, []);

  // =====================
  // SIMULATION (OTHER USERS ONLY)
  // =====================
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const run = () => {
      const me = getCurrentUser();
      const others = users.filter((u: User) => u.id !== me.id);

      if (others.length > 0) {
        const randomUser =
          others[Math.floor(Math.random() * others.length)];

        const statuses: UserStatus[] = [
          "office",
          "remote",
          "client",
          "offline"
        ];

        const newStatus =
          statuses[Math.floor(Math.random() * statuses.length)];

        updateStatus(newStatus, randomUser.id);

        // 🔥 ONLY simulation logs
        addActivity(`${randomUser.name} switched to ${newStatus}`);
      }

      timeoutId = setTimeout(run, Math.random() * 60000 + 60000);
    };

    timeoutId = setTimeout(run, 60000);

    return () => clearTimeout(timeoutId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =====================
  // COUNTS
  // =====================
  const counts = useMemo(() => ({
    office: users.filter((u: User) => u.status === "office").length,
    remote: users.filter((u: User) => u.status === "remote").length,
    client: users.filter((u: User) => u.status === "client").length,
    offline: users.filter((u: User) => u.status === "offline").length
  }), [users]);

  // =====================
  // FILTER
  // =====================
  const visibleUsers = useMemo(() => {
    if (filter === "all") return users;
    return users.filter((u: User) => u.status === filter);
  }, [users, filter]);

  const sortedUsers = useMemo(() => {
    return [...visibleUsers].sort((a, b) => {
      if (a.status === "office" && b.status !== "office") return -1;
      if (a.status !== "office" && b.status === "office") return 1;
      return a.name.localeCompare(b.name);
    });
  }, [visibleUsers]);

  const weekNumber = getWeekNumber(new Date());

  // =====================
  // HISTORY
  // =====================
  const weekly = useMemo(() => getWeeklyOfficeHistory(), []);
  const monthly = useMemo(() => getMonthlyOfficeHistory(), []);

  // =====================
  // CHART DATA
  // =====================
  const COLORS: Record<UserStatus, string> = {
    office: "#4ade80",
    remote: "#fb923c",
    client: "#60a5fa",
    offline: "#9ca3af"
  };

  const pieData = [
    { name: "Office", value: counts.office, key: "office" as UserStatus },
    { name: "Remote", value: counts.remote, key: "remote" as UserStatus },
    { name: "Client", value: counts.client, key: "client" as UserStatus },
    { name: "Offline", value: counts.offline, key: "offline" as UserStatus }
  ];

  return (
    <div className="presence-layout">

      {/* ✅ DAILY CHECK-IN FIX */}
      <DailyCheckinPopup />

      {/* 🚨 EMERGENCY MODAL */}
      {emergency && (
        <EmergencyModal
          count={emergency}
          onClose={() => setEmergency(null)}
        />
      )}

      <div className="presence-main">

        <StatusUpdateBar />

        <h1 className="page-title">Presence Overview</h1>
        <div className="presence-page-meta">Week {weekNumber}</div>

        <div className="presence-cards-grid">

          {/* DAILY */}
          <div className="chart-card">
            <h2>Daily</h2>

            <div className="daily-stats-grid">
              {(["office", "remote", "client", "offline"] as UserStatus[]).map(type => (
                <div
                  key={type}
                  className={`daily-stat ${type}`}
                  onClick={() => setFilter(type)}
                >
                  <span>{type}</span>
                  <strong>{counts[type]}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* WEEK */}
          <div className="chart-card">
            <h2>Weekly</h2>
            {weekly.map(row => (
              <div key={row.dayLabel} className="weekly-row">
                {row.dayLabel} — {row.office}
              </div>
            ))}
          </div>

          {/* MONTH */}
          <div className="chart-card">
            <h2>Month</h2>

            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="weekLabel" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="office" fill="#6264A7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* PIE */}
          <div className="chart-card">
            <h2>Today</h2>

            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[entry.key]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* USERS */}
        <div className="chart-card">
          <h2>Users ({sortedUsers.length})</h2>

          <div className="office-list-grid">
            {sortedUsers.map((u: User) => (
              <div key={u.id} className="office-list-user">
                <div className="office-avatar">{u.initials}</div>
                <div>
                  <div>{u.name}</div>
                  <div>{u.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="presence-sidebar">
        <ActivityFeed />
      </div>

    </div>
  );
}