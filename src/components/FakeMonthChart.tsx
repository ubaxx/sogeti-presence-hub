export default function FakeMonthChart() {

  const data = [
    { week: 1, value: 65 },
    { week: 2, value: 80 },
    { week: 3, value: 55 },
    { week: 4, value: 90 }
  ];

  return (
    <div className="monthly-bars">
      {data.map((d) => (
        <div key={d.week} className="monthly-bar">
          <div
            className="monthly-fill"
            style={{ width: `${d.value}%` }}
          />
          <span>Week {d.week}</span>
        </div>
      ))}
    </div>
  );
}