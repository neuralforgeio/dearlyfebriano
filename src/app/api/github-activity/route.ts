import { NextResponse } from "next/server";

export const revalidate = 300;

const QUERY = `
  query DeveloperActivity(
    $username: String!
    $from: DateTime!
    $to: DateTime!
  ) {
    user(login: $username) {
      login
      contributionsCollection(from: $from, to: $to) {
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

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME ?? "dearlyfebriano";

  if (!token) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN belum dikonfigurasi di server." },
      { status: 500 },
    );
  }

  const to = new Date();
  const from = new Date(to);
  from.setUTCFullYear(from.getUTCFullYear() - 1);

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: QUERY,
        variables: {
          username,
          from: from.toISOString(),
          to: to.toISOString(),
        },
      }),
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || result.errors?.length) {
      console.error("GitHub GraphQL error:", {
        status: response.status,
        errors: result.errors?.map((item: { message: string }) => item.message),
        message: result.message,
      });

      return NextResponse.json(
        {
          error: "GitHub gagal mengembalikan data kontribusi.",
          details:
            result.errors
              ?.map((item: { message: string }) => item.message)
              .join("; ") ??
            result.message ??
            `GitHub HTTP ${response.status}`,
        },
        { status: 502 },
      );
    }

    const user = result.data?.user;

    if (!user) {
      return NextResponse.json(
        {
          error: `Pengguna GitHub "${username}" tidak ditemukan.`,
        },
        { status: 404 },
      );
    }

    const calendar = user.contributionsCollection.contributionCalendar;

    return NextResponse.json(
      {
        username: user.login,
        totalContributions: calendar.totalContributions,
        weeks: calendar.weeks.map(
          (week: {
            contributionDays: {
              date: string;
              contributionCount: number;
              contributionLevel: string;
            }[];
          }) => week.contributionDays,
        ),
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    console.error("GitHub activity request failed:", error);

    return NextResponse.json(
      { error: "Tidak dapat terhubung ke GitHub saat ini." },
      { status: 502 },
    );
  }
}
