import { Theme } from './themes';
import { ContributionData } from './github';

const CELL_SIZE = 11;
const CELL_GAP = 3;
const MONTH_LABEL_HEIGHT = 20;
const DAY_LABEL_WIDTH = 40;
const LEGEND_HEIGHT = 30;
const PADDING = 20;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface RenderOptions {
  canvas: HTMLCanvasElement;
  theme: Theme;
  data: ContributionData;
  username: string;
  visibleDays?: number; // For animation - show only first N days
  offsetX?: number; // For frame jitter
  offsetY?: number;
}

export function renderContributionChart(options: RenderOptions): void {
  const { canvas, theme, data, username, visibleDays, offsetX = 0, offsetY = 0 } = options;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear and fill background
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, width, height);
  
  // Apply offset for frame jitter
  ctx.save();
  ctx.translate(offsetX, offsetY);
  
  const gridStartX = DAY_LABEL_WIDTH + PADDING;
  const gridStartY = MONTH_LABEL_HEIGHT + PADDING;
  
  // Calculate visible contributions
  let visibleCount = 0;
  let dayIndex = 0;
  
  // Draw month labels
  ctx.fillStyle = theme.textMuted;
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  
  let currentMonth = -1;
  data.weeks.forEach((week, weekIdx) => {
    const monthOfFirstDay = new Date(week[0].date).getMonth();
    if (monthOfFirstDay !== currentMonth) {
      currentMonth = monthOfFirstDay;
      const x = gridStartX + weekIdx * (CELL_SIZE + CELL_GAP);
      ctx.fillText(MONTHS[currentMonth], x, PADDING + 12);
    }
  });
  
  // Draw day labels (Mon, Wed, Fri)
  ctx.fillStyle = theme.textMuted;
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'right';
  
  [1, 3, 5].forEach((dayIdx) => {
    const y = gridStartY + dayIdx * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2 + 4;
    ctx.fillText(DAYS[dayIdx], DAY_LABEL_WIDTH + PADDING - 8, y);
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
      ctx.roundRect(x, y, CELL_SIZE, CELL_SIZE, 2);
      ctx.fill();
    });
  });
  
  // Draw header with username and count
  const count = visibleDays !== undefined ? visibleCount : data.totalContributions;
  ctx.fillStyle = theme.text;
  ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${count} contributions in ${data.year}`, PADDING, 15);
  
  // Draw @username on the right
  ctx.textAlign = 'right';
  ctx.fillStyle = theme.textMuted;
  ctx.fillText(`@${username}`, width - PADDING, 15);
  
  // Draw legend at bottom
  const legendY = height - LEGEND_HEIGHT / 2 - 5;
  const legendX = width - PADDING - 180;
  
  ctx.fillStyle = theme.textMuted;
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Less', legendX, legendY + 4);
  
  // Draw legend squares
  const squareStartX = legendX + 35;
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = theme.levels[i];
    ctx.beginPath();
    ctx.roundRect(squareStartX + i * (CELL_SIZE + 2), legendY - 5, CELL_SIZE, CELL_SIZE, 2);
    ctx.fill();
  }
  
  ctx.fillStyle = theme.textMuted;
  ctx.fillText('More', squareStartX + 5 * (CELL_SIZE + 2) + 5, legendY + 4);
  
  ctx.restore();
}

export function getCanvasDimensions(): { width: number; height: number } {
  const gridWidth = 53 * (CELL_SIZE + CELL_GAP);
  const gridHeight = 7 * (CELL_SIZE + CELL_GAP);
  
  return {
    width: gridWidth + DAY_LABEL_WIDTH + PADDING * 2,
    height: gridHeight + MONTH_LABEL_HEIGHT + LEGEND_HEIGHT + PADDING * 2,
  };
}
