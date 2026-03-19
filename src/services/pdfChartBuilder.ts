export function buildBarChartImage(data: number[], labels: string[]): string {

  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 300;

  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const max = Math.max(...data, 1);

  const barWidth = 40;
  const gap = 30;

  data.forEach((value, i) => {

    const x = 50 + i * (barWidth + gap);
    const height = (value / max) * 200;
    const y = 250 - height;

    // bar
    ctx.fillStyle = "#6264A7";
    ctx.fillRect(x, y, barWidth, height);

    // label
    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.fillText(labels[i], x, 270);

    // value
    ctx.fillText(String(value), x, y - 5);

  });

  return canvas.toDataURL("image/png");
}