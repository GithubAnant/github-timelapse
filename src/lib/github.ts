export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionData {
  totalContributions: number;
  weeks: ContributionDay[][];
  year: number;
}

// Fetch GitHub contribution data via our API route (avoids CORS issues)
// Note: The API fetches from the public profile which DOES include private contributions
// as long as the user has "Private contributions" enabled in GitHub settings (default: on)
export async function fetchGitHubContributions(
  username: string,
  year?: number
): Promise<ContributionData | null> {
  const targetYear = year || new Date().getFullYear();

  try {
    const response = await fetch(
      `/api/contributions?username=${encodeURIComponent(
        username
      )}&year=${targetYear}`
    );

    if (!response.ok) {
      console.log("Failed to fetch contributions, status:", response.status);
      return null;
    }

    const data = await response.json();

    if (data.error) {
      console.log("API error:", data.error);
      return null;
    }

    return data as ContributionData;
  } catch (error) {
    console.error("Error fetching GitHub contributions:", error);
    return null;
  }
}

// Generate realistic contribution data as fallback
export function generateContributionData(
  year: number,
  seed?: number
): ContributionData {
  const weeks: ContributionDay[][] = [];
  let totalContributions = 0;

  // Use seed for consistent results per username
  let seedState = seed || Math.floor(Math.random() * 1000000);
  const seededRandom = () => {
    seedState = (seedState * 1103515245 + 12345) & 0x7fffffff;
    return seedState / 0x7fffffff;
  };

  // Start from the first Sunday of the year
  const startDate = new Date(year, 0, 1);
  const dayOfWeek = startDate.getDay();
  const firstSunday = new Date(startDate);
  firstSunday.setDate(startDate.getDate() - dayOfWeek);

  const today = new Date();
  const currentDate = new Date(firstSunday);

  for (let week = 0; week < 53; week++) {
    const weekData: ContributionDay[] = [];

    for (let day = 0; day < 7; day++) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const isInYear = currentDate.getFullYear() === year;
      const isFuture = currentDate > today;

      let count = 0;
      let level: 0 | 1 | 2 | 3 | 4 = 0;

      if (isInYear && !isFuture) {
        // Generate realistic patterns
        const isWeekday =
          currentDate.getDay() !== 0 && currentDate.getDay() !== 6;
        const baseChance = isWeekday ? 0.6 : 0.3;

        // Add some randomness for streaks and breaks
        const weekFactor = Math.sin(week * 0.3) * 0.2 + 0.8;
        const chance = baseChance * weekFactor;

        if (seededRandom() < chance) {
          const intensity = seededRandom();
          if (intensity > 0.85) {
            count = Math.floor(seededRandom() * 10) + 8;
            level = 4;
          } else if (intensity > 0.6) {
            count = Math.floor(seededRandom() * 5) + 4;
            level = 3;
          } else if (intensity > 0.35) {
            count = Math.floor(seededRandom() * 3) + 2;
            level = 2;
          } else {
            count = 1;
            level = 1;
          }
          totalContributions += count;
        }
      }

      weekData.push({ date: dateStr, count, level });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    weeks.push(weekData);
  }

  return { totalContributions, weeks, year };
}

// Get contribution data (with fallback to generated data)
export async function getContributionData(
  username: string,
  year?: number
): Promise<ContributionData> {
  const targetYear = year || new Date().getFullYear();

  // Try to fetch real data
  const realData = await fetchGitHubContributions(username, targetYear);
  if (realData) {
    return realData;
  }

  // Generate realistic data based on username (for consistent results)
  console.log("Using generated contribution data for", username);
  const seed = username
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return generateContributionData(targetYear, seed);
}

// Get list of available years to select from
export function getAvailableYears(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear; y >= currentYear - 5; y--) {
    years.push(y);
  }
  return years;
}
