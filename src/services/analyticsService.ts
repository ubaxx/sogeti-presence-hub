import {
  collection,
  onSnapshot,
  query,
  where
} from "firebase/firestore";

import { db } from "./firebase";

export type PresenceLog = {
  userId: string;
  name: string;
  group: string;
  status: "office" | "remote" | "client" | "offline";
  date: string;
  ts: number;
};

export type DailySummary = {
  date: string;
  office: number;
  remote: number;
  client: number;
  offline: number;
  totalEvents: number;
};

const LOG_COLLECTION = "presenceLogs";

function getDate(daysAgo: number) {

  const d = new Date();
  d.setDate(d.getDate() - daysAgo);

  return d.toISOString().split("T")[0];

}

function formatDate(date: string) {

  const d = new Date(date);

  return d.toLocaleDateString("sv-SE", {
    day: "2-digit",
    month: "2-digit"
  });

}

export function subscribeDailySummaryLastNDays(
  days: number,
  callback: (summary: DailySummary[]) => void
) {

  const startDate = getDate(days - 1);

  const q = query(
    collection(db, LOG_COLLECTION),
    where("date", ">=", startDate)
  );

  return onSnapshot(q, (snap) => {

    const logs: PresenceLog[] =
      snap.docs.map(d => d.data() as PresenceLog);

    const map = new Map<string, DailySummary>();

    for (const l of logs) {

      if (!map.has(l.date)) {

        map.set(l.date, {
          date: l.date,
          office: 0,
          remote: 0,
          client: 0,
          offline: 0,
          totalEvents: 0
        });

      }

      const s = map.get(l.date)!;

      s.totalEvents++;

      switch (l.status) {

        case "office":
          s.office++;
          break;

        case "remote":
          s.remote++;
          break;

        case "client":
          s.client++;
          break;

        default:
          s.offline++;

      }

    }

    const result: DailySummary[] = [];

    for (let i = days - 1; i >= 0; i--) {

      const d = getDate(i);

      const entry = map.get(d) || {
        date: d,
        office: 0,
        remote: 0,
        client: 0,
        offline: 0,
        totalEvents: 0
      };

      result.push({
        ...entry,
        date: formatDate(entry.date)
      });

    }

    callback(result);

  });

}