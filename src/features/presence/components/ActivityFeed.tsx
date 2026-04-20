import { useSyncExternalStore } from "react";
import {
  type Activity,
  getActivities,
  subscribeActivity
} from "../../../services/activityStore";

function getActivityMeta(activity: Activity) {
  const match = activity.text.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  const name = match?.[1] ?? "Presence Hub";
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  let tone = "system";

  if (activity.text.includes("office")) {
    tone = "office";
  } else if (activity.text.includes("remote")) {
    tone = "remote";
  } else if (activity.text.includes("client")) {
    tone = "client";
  } else if (activity.text.includes("offline")) {
    tone = "offline";
  }

  return {
    initials,
    label: match ? "Team update" : "System update",
    tone
  };
}

export default function ActivityFeed() {
  const activities = useSyncExternalStore(
    subscribeActivity,
    getActivities,
    getActivities
  );

  return (
    <div className="activity-feed">
      <div className="activity-feed-header">
        <div>
          <div className="activity-feed-kicker">Live team feed</div>
          <h3>Activity</h3>
        </div>
        <div className="activity-feed-count">{activities.length}</div>
      </div>

      <div className="activity-feed-subtitle">
        Recent presence updates and reminders from across the workplace
      </div>

      {activities.length === 0 && (
        <div className="activity-item activity-item-empty">
          <div className="activity-item-avatar">PH</div>
          <div className="activity-item-body">
            <div className="activity-item-topline">
              <div className="activity-item-label">Presence Hub</div>
            </div>
            <div className="activity-text">No activity yet</div>
            <div className="activity-time">Waiting for the next update</div>
          </div>
        </div>
      )}

      {activities.map((activity) => {
        const meta = getActivityMeta(activity);

        return (
          <div key={activity.id} className={`activity-item ${meta.tone}`}>
            <div className="activity-item-avatar">{meta.initials}</div>
            <div className="activity-item-body">
              <div className="activity-item-topline">
                <div className="activity-item-label">{meta.label}</div>
                <div className="activity-time">{activity.time}</div>
              </div>
              <div className="activity-text">{activity.text}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
