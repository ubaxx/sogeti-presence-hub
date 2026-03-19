import { useSyncExternalStore } from "react";
import {
  getActivities,
  subscribeActivity
} from "../services/activityStore";

export default function ActivityFeed() {
  const activities = useSyncExternalStore(
    subscribeActivity,
    getActivities,
    getActivities
  );

  return (
    <div className="activity-feed">
      <h3>Activity</h3>

      {activities.length === 0 && (
        <div className="activity-item">
          <div className="activity-text">No activity yet</div>
          <div className="activity-time">Waiting...</div>
        </div>
      )}

      {activities.map((a) => (
        <div key={a.id} className="activity-item">
          <div className="activity-text">{a.text}</div>
          <div className="activity-time">{a.time}</div>
        </div>
      ))}
    </div>
  );
}