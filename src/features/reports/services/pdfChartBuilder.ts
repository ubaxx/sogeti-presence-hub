type ChartOptions = {
  title?: string;
  subtitle?: string;
  highlightIndex?: number;
  accentColor?: string;
  mutedColor?: string;
  gridColor?: string;
};

export function buildBarChartImage(
  data: number[],
  labels: string[],
  options: ChartOptions = {}
): string {
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 380;

  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const {
    title,
    subtitle,
    highlightIndex = -1,
    accentColor = "#6264A7",
    mutedColor = "rgba(98, 100, 167, 0.35)",
    gridColor = "#E7EAF1"
  } = options;

  const max = Math.max(...data, 1);
  const left = 56;
  const right = 28;
  const top = title ? 74 : 42;
  const bottom = 58;
  const chartWidth = canvas.width - left - right;
  const chartHeight = canvas.height - top - bottom;
  const slotWidth = chartWidth / Math.max(data.length, 1);
  const barWidth = Math.min(54, slotWidth * 0.55);
  const steps = 4;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (title) {
    ctx.fillStyle = "#1C202B";
    ctx.font = "700 20px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(title, left, 28);
  }

  if (subtitle) {
    ctx.fillStyle = "#626C7A";
    ctx.font = "12px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(subtitle, left, 48);
  }

  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;

  for (let step = 0; step <= steps; step += 1) {
    const y = top + (chartHeight / steps) * step;
    const value = Math.round(max - (max / steps) * step);

    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(canvas.width - right, y);
    ctx.stroke();

    ctx.fillStyle = "#7A8291";
    ctx.font = "11px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(String(value), left - 8, y + 4);
  }

  data.forEach((value, index) => {
    const x = left + slotWidth * index + (slotWidth - barWidth) / 2;
    const barHeight = (value / max) * chartHeight;
    const y = top + chartHeight - barHeight;
    const radius = 10;
    const fill =
      index === highlightIndex || (highlightIndex < 0 && value === max)
        ? accentColor
        : mutedColor;

    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.lineTo(x + barWidth - radius, y);
    ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
    ctx.lineTo(x + barWidth, y + barHeight);
    ctx.lineTo(x, y + barHeight);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#1C202B";
    ctx.font = "700 12px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(value), x + barWidth / 2, y - 8);

    ctx.fillStyle = "#626C7A";
    ctx.font = "11px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(labels[index], x + barWidth / 2, canvas.height - 22);
  });

  ctx.strokeStyle = "#C9D0DC";
  ctx.beginPath();
  ctx.moveTo(left, top + chartHeight);
  ctx.lineTo(canvas.width - right, top + chartHeight);
  ctx.stroke();

  return canvas.toDataURL("image/png");
}
