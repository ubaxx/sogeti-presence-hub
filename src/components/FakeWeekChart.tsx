export default function FakeWeekChart() {

  const data = [
    { day: "Mon", value: 18 },
    { day: "Tue", value: 12 },
    { day: "Wed", value: 22 },
    { day: "Thu", value: 15 },
    { day: "Fri", value: 19 }
  ];

  return (
    <div className="weekly-bars">
      {data.map((d) => (
        <div key={d.day} className="weekly-bar">
          <div
            className="weekly-fill"
            style={{ height: `${d.value * 4}px` }}
          />
          <span>{d.day}</span>
        </div>
      ))}
    </div>
  );
}