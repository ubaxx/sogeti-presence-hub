type Props = {
  data: number[];
};

export default function OfficeHeatmap({ data }: Props) {
  function getClassName(value: number): string {
    if (value === 0) return "heat-cell heat-empty";
    if (value < 5) return "heat-cell heat-low";
    if (value < 10) return "heat-cell heat-medium";
    if (value < 15) return "heat-cell heat-high";
    return "heat-cell heat-peak";
  }

  return (
    <div className="heatmap-grid">
      {data.map((value, index) => (
        <div
          key={index}
          className={getClassName(value)}
          title={`${value} people`}
        />
      ))}
    </div>
  );
}