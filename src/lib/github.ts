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

// Generate realistic contribution data
export function generateContributionData(year: number): ContributionData {
  const weeks: ContributionDay[][] = [];
  let totalContributions = 0;
  
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
      const dateStr = currentDate.toISOString().split('T')[0];
      const isInYear = currentDate.getFullYear() === year;
      const isFuture = currentDate > today;
      
      let count = 0;
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      
      if (isInYear && !isFuture) {
        // Generate realistic patterns
        const isWeekday = currentDate.getDay() !== 0 && currentDate.getDay() !== 6;
        const baseChance = isWeekday ? 0.6 : 0.3;
        
        // Add some randomness for streaks and breaks
        const weekFactor = Math.sin(week * 0.3) * 0.2 + 0.8;
        const chance = baseChance * weekFactor;
        
        if (Math.random() < chance) {
          const intensity = Math.random();
          if (intensity > 0.85) {
            count = Math.floor(Math.random() * 10) + 8;
            level = 4;
          } else if (intensity > 0.6) {
            count = Math.floor(Math.random() * 5) + 4;
            level = 3;
          } else if (intensity > 0.35) {
            count = Math.floor(Math.random() * 3) + 2;
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

// Fetch real GitHub contribution data
export async function fetchGitHubContributions(username: string): Promise<ContributionData | null> {
  const year = new Date().getFullYear();
  
  try {
    // Using GitHub's GraphQL API via a proxy or direct call
    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                  contributionLevel
                }
              }
            }
          }
        }
      }
    `;
    
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN || ''}`,
      },
      body: JSON.stringify({ query, variables: { username } }),
    });
    
    if (!response.ok) {
      console.log('GitHub API not available, using generated data');
      return null;
    }
    
    const data = await response.json();
    
    if (data.errors || !data.data?.user) {
      return null;
    }
    
    const calendar = data.data.user.contributionsCollection.contributionCalendar;
    const weeks: ContributionDay[][] = calendar.weeks.map((week: { contributionDays: Array<{ date: string; contributionCount: number; contributionLevel: string }> }) =>
      week.contributionDays.map((day: { date: string; contributionCount: number; contributionLevel: string }) => ({
        date: day.date,
        count: day.contributionCount,
        level: levelFromString(day.contributionLevel),
      }))
    );
    
    return {
      totalContributions: calendar.totalContributions,
      weeks,
      year,
    };
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    return null;
  }
}

function levelFromString(level: string): 0 | 1 | 2 | 3 | 4 {
  switch (level) {
    case 'NONE': return 0;
    case 'FIRST_QUARTILE': return 1;
    case 'SECOND_QUARTILE': return 2;
    case 'THIRD_QUARTILE': return 3;
    case 'FOURTH_QUARTILE': return 4;
    default: return 0;
  }
}

// Get contribution data (with fallback to generated data)
export async function getContributionData(username: string): Promise<ContributionData> {
  const realData = await fetchGitHubContributions(username);
  if (realData) {
    return realData;
  }
  
  // Generate realistic data based on username (for consistent results)
  const seed = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const originalRandom = Math.random;
  
  // Simple seeded random
  let seedState = seed;
  Math.random = () => {
    seedState = (seedState * 1103515245 + 12345) & 0x7fffffff;
    return seedState / 0x7fffffff;
  };
  
  const data = generateContributionData(new Date().getFullYear());
  
  Math.random = originalRandom;
  
  return data;
}
