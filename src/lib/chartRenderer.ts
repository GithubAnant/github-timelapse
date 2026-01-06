import { Theme } from "./themes";
import { ContributionData } from "./github";

// Increased sizes for higher quality render
const CELL_SIZE = 12;
const CELL_GAP = 4;
const CELL_RADIUS = 3;
const MONTH_LABEL_HEIGHT = 24;
const DAY_LABEL_WIDTH = 36;
const LEGEND_HEIGHT = 36;
const PADDING = 32; // Increased padding
const HEADER_HEIGHT = 48; // Increased header height for better separation

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface RenderOptions {
  canvas: HTMLCanvasElement;
  theme: Theme;
  data: ContributionData;
  username: string;
  visibleDays?: number; // For animation - show only first N days
  scale?: number; // For HiDPI rendering
}

export function renderContributionChart(options: RenderOptions): void {
  const { canvas, theme, data, username, visibleDays, scale = 1 } = options;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Clear and fill background
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, width, height);

  // Apply scale for HiDPI rendering
  ctx.save();
  ctx.scale(scale, scale);

  // Enable anti-aliasing for smoother rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const gridStartX = DAY_LABEL_WIDTH + 10; // Shifted left significantly (was PADDING)
  const gridStartY = HEADER_HEIGHT + MONTH_LABEL_HEIGHT + PADDING; // More vertical space

  // Calculate visible contributions
  let visibleCount = 0;
  let dayIndex = 0;

  // Draw month labels
  ctx.fillStyle = theme.textMuted;
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = "left";

  let currentMonth = -1;
  let lastLabelX = -100; // Track last label position to prevent overlap
  const minLabelSpacing = 30; // Minimum pixels between labels

  data.weeks.forEach((week, weekIdx) => {
    const firstDayDate = new Date(week[0].date);
    const monthOfFirstDay = firstDayDate.getMonth();
    const yearOfFirstDay = firstDayDate.getFullYear();

    // Skip labels from previous year (e.g., Dec when viewing 2026)
    if (yearOfFirstDay < data.year) {
      return;
    }

    if (monthOfFirstDay !== currentMonth) {
      currentMonth = monthOfFirstDay;
      const x = gridStartX + weekIdx * (CELL_SIZE + CELL_GAP);

      // Only draw if there's enough spacing from the last label
      if (x - lastLabelX >= minLabelSpacing) {
        ctx.fillText(MONTHS[currentMonth], x, PADDING + 12);
        lastLabelX = x;
      }
    }
  });

  // Draw day labels (Mon, Wed, Fri)
  ctx.fillStyle = theme.textMuted;
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = "right";

  [1, 3, 5].forEach((dayIdx) => {
    const y = gridStartY + dayIdx * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2 + 4;
    ctx.fillText(DAYS[dayIdx], DAY_LABEL_WIDTH + 6, y); // Shifted left (was DAY_LABEL_WIDTH + PADDING - 8)
  });

  // Draw contribution grid
  data.weeks.forEach((week, weekIdx) => {
    week.forEach((day, dayIdx) => {
      dayIndex++;

      const x = gridStartX + weekIdx * (CELL_SIZE + CELL_GAP);
      const y = gridStartY + dayIdx * (CELL_SIZE + CELL_GAP);

      // Determine the level to show based on visibleDays
      let level = day.level;
      if (visibleDays !== undefined && dayIndex > visibleDays) {
        level = 0;
      } else if (day.level > 0) {
        visibleCount += day.count;
      }

      ctx.fillStyle = theme.levels[level];
      ctx.beginPath();
      ctx.roundRect(x, y, CELL_SIZE, CELL_SIZE, CELL_RADIUS);
      ctx.fill();
    });
  });

  // Draw header with username and count
  const count =
    visibleDays !== undefined ? visibleCount : data.totalContributions;
  const scaledWidth = width / scale;
  ctx.fillStyle = theme.text;
  ctx.font =
    'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = "left";
  ctx.fillText(
    `${count.toLocaleString()} contributions in ${data.year}`,
    16, // Shifted left (was PADDING)
    28 // Moved up (was PADDING + 4/10)
  );

  // Draw @username on the right with extra padding to prevent cutoff
  ctx.textAlign = "right";
  ctx.fillStyle = theme.textMuted;
  ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(`@${username}`, scaledWidth - 16, 28); // Moved up and adjusted right margin

  // Draw legend at bottom
  const scaledHeight = height / scale;
  const legendY = scaledHeight - LEGEND_HEIGHT / 2 - 4;
  const legendX = scaledWidth - PADDING - 160;

  ctx.fillStyle = theme.textMuted;
  ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = "left";
  ctx.fillText("Less", legendX, legendY + 3);

  // Draw legend squares
  const legendCellSize = 10;
  const squareStartX = legendX + 30;
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = theme.levels[i];
    ctx.beginPath();
    ctx.roundRect(
      squareStartX + i * (legendCellSize + 3),
      legendY - 4,
      legendCellSize,
      legendCellSize,
      2
    );
    ctx.fill();
  }

  ctx.fillStyle = theme.textMuted;
  ctx.fillText(
    "More",
    squareStartX + 5 * (legendCellSize + 3) + 4,
    legendY + 3
  );

  ctx.restore();
}

export function getCanvasDimensions(): { width: number; height: number } {
  const gridWidth = 53 * (CELL_SIZE + CELL_GAP);
  const gridHeight = 7 * (CELL_SIZE + CELL_GAP);

  return {
    width: gridWidth + DAY_LABEL_WIDTH + PADDING * 2,
    height:
      gridHeight +
      HEADER_HEIGHT +
      MONTH_LABEL_HEIGHT +
      LEGEND_HEIGHT +
      PADDING * 2,
  };
}
