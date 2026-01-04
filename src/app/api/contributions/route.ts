import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get("username");
  const year = searchParams.get("year") || new Date().getFullYear().toString();

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  try {
    const url = `https://github.com/users/${username}/contributions?from=${year}-01-01&to=${year}-12-31`;

    const response = await fetch(url, {
      headers: {
        Accept: "text/html",
        "User-Agent": "GitHub-Timelapse-App",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch GitHub data", status: response.status },
        { status: response.status }
      );
    }

    const html = await response.text();

    // Parse contribution data
    const contributions: Map<
      string,
      { count: number; level: 0 | 1 | 2 | 3 | 4 }
    > = new Map();

    const datePattern = /data-date="(\d{4}-\d{2}-\d{2})"/g;
    const levelPattern = /data-level="(\d)"/g;

    const dates: string[] = [];
    let match;
    while ((match = datePattern.exec(html)) !== null) {
      dates.push(match[1]);
    }

    const levels: number[] = [];
    while ((match = levelPattern.exec(html)) !== null) {
      levels.push(parseInt(match[1]));
    }

    for (let i = 0; i < Math.min(dates.length, levels.length); i++) {
      contributions.set(dates[i], {
        count: levels[i] > 0 ? levels[i] * 2 : 0,
        level: levels[i] as 0 | 1 | 2 | 3 | 4,
      });
    }

    // Parse total contributions
    const totalMatch =
      html.match(/([\d,]+)\s+contributions?\s+in\s+the\s+last\s+year/i) ||
      html.match(/([\d,]+)\s+contributions?\s+in\s+\d{4}/i);
    const totalContributions = totalMatch
      ? parseInt(totalMatch[1].replace(/,/g, ""))
      : Array.from(contributions.values()).reduce((sum, c) => sum + c.count, 0);

    // Build weeks array
    const targetYear = parseInt(year);
    const weeks: Array<
      Array<{ date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }>
    > = [];
    const startDate = new Date(targetYear, 0, 1);
    const dayOfWeek = startDate.getDay();
    const firstSunday = new Date(startDate);
    firstSunday.setDate(startDate.getDate() - dayOfWeek);

    const currentDate = new Date(firstSunday);

    for (let week = 0; week < 53; week++) {
      const weekData: Array<{
        date: string;
        count: number;
        level: 0 | 1 | 2 | 3 | 4;
      }> = [];

      for (let day = 0; day < 7; day++) {
        const dateStr = currentDate.toISOString().split("T")[0];
        const contrib = contributions.get(dateStr);

        weekData.push({
          date: dateStr,
          count: contrib?.count || 0,
          level: contrib?.level || 0,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      weeks.push(weekData);
    }

    if (contributions.size > 0) {
      return NextResponse.json({
        totalContributions,
        weeks,
        year: targetYear,
      });
    }

    return NextResponse.json(
      { error: "No contributions found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error fetching GitHub contributions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
