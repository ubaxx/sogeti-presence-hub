import { getPresenceLogs } from "../services/presenceLogService";
import "../styles/dashboard.css";

type DayData = {
  day: string;
  value: number;
};

export default function WeeklyUtilisation() {

  const logs = getPresenceLogs();

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const result: Record<string, number> = {
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0
  };

  logs.forEach((l) => {

    if (l.status !== "office") return;

    const date = new Date(l.date);
    const dayIndex = (date.getDay() + 6) % 7; // fix Monday start

    const day = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][dayIndex];

    if (result[day] !== undefined) {
      result[day]++;
    }

  });

  const data: DayData[] = days.map((d) => ({
    day: d,
    value: result[d]
  }));

  return (

    <div className="weekly-box">

      <h2>Weekly Office Utilisation</h2>

      <div className="weekly-bars">

        {data.map((d) => (

          <div key={d.day} className="weekly-bar">

            <div
              className="bar-fill"
              style={{ height: `${d.value * 10}px` }}
            />

            <span>{d.day}</span>
            <span className="bar-value">{d.value}</span>

          </div>

        ))}

      </div>

    </div>

  );

}