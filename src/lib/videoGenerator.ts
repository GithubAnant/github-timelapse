import { Theme } from './themes';
import { ContributionData } from './github';
import { renderContributionChart, getCanvasDimensions } from './chartRenderer';

export interface VideoGeneratorOptions {
  theme: Theme;
  data: ContributionData;
  username: string;
  onProgress?: (current: number, total: number) => void;
}

export async function generateTimelapse(options: VideoGeneratorOptions): Promise<Blob> {
  const { theme, data, username, onProgress } = options;
  const { width, height } = getCanvasDimensions();
  
  // Create offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  // Count total days
  let totalDays = 0;
  data.weeks.forEach(week => {
    week.forEach(day => {
      const dayDate = new Date(day.date);
      const today = new Date();
      if (dayDate <= today && dayDate.getFullYear() === data.year) {
        totalDays++;
      }
    });
  });
  
  // Set up MediaRecorder with WebM
  const stream = canvas.captureStream(30);
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 5000000, // 5 Mbps
  });
  
  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };
  
  return new Promise((resolve, reject) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(blob);
    };
    
    mediaRecorder.onerror = (e) => {
      reject(e);
    };
    
    mediaRecorder.start();
    
    let currentDay = 0;
    
    const renderFrame = () => {
      if (currentDay > totalDays) {
        // Hold on final frame for a moment
        setTimeout(() => {
          mediaRecorder.stop();
        }, 500);
        return;
      }
      
      // Add subtle random offset for authentic screenshot feel
      const offsetX = (Math.random() - 0.5) * 1.6; // ±0.8px
      const offsetY = (Math.random() - 0.5) * 1.6;
      
      renderContributionChart({
        canvas,
        theme,
        data,
        username,
        visibleDays: currentDay,
        offsetX,
        offsetY,
      });
      
      if (onProgress) {
        onProgress(currentDay, totalDays);
      }
      
      currentDay++;
      
      // 40ms per frame for smooth playback
      setTimeout(renderFrame, 40);
    };
    
    renderFrame();
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
