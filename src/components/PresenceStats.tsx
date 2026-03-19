export default function PresenceStats() {

  const weekData = [
    { day: "Mon", office: 12 },
    { day: "Tue", office: 18 },
    { day: "Wed", office: 22 },
    { day: "Thu", office: 15 },
    { day: "Fri", office: 10 }
  ];

  const monthData = [
    { week: "Week 1", avg: 12 },
    { week: "Week 2", avg: 18 },
    { week: "Week 3", avg: 20 },
    { week: "Week 4", avg: 15 }
  ];

  return (
    <div className="stats-card">

      <h2>Office utilisation</h2>

      <div className="stats-section">
        <h3>Weekly view</h3>
        <div className="stats-row">
          {weekData.map(d => (
            <div key={d.day} className="stats-box">
              <div>{d.day}</div>
              <strong>{d.office}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-section">
        <h3>Monthly view</h3>
        <div className="stats-row">
          {monthData.map(m => (
            <div key={m.week} className="stats-box">
              <div>{m.week}</div>
              <strong>{m.avg}</strong>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}