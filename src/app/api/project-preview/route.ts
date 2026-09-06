import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return new Response("Missing 'url' query parameter", { status: 400 });
  }

  try {
    const target = new URL(url);

    if (!["http:", "https:"].includes(target.protocol)) {
      return new Response("Invalid URL protocol", { status: 400 });
    }

    const screenshotUrl = new URL("https://api.screenshotone.com/take");

    screenshotUrl.searchParams.set(
      "access_key",
      process.env.SCREENSHOTONE_ACCESS_KEY!,
    );
    screenshotUrl.searchParams.set("url", target.toString());
    screenshotUrl.searchParams.set("viewport_width", "1440");
    screenshotUrl.searchParams.set("viewport_height", "900");
    screenshotUrl.searchParams.set("format", "webp");
    screenshotUrl.searchParams.set("block_cookie_banners", "true");
    screenshotUrl.searchParams.set("block_ads", "true");
    screenshotUrl.searchParams.set("reduced_motion", "true");

    const response = await fetch(screenshotUrl.toString(), {
      next: {
        revalidate: 86400,
      },
    });

    if (!response.ok) {
      return new Response("Failed to fetch project preview", { status: 500 });
    }

    const image = await response.arrayBuffer();

    return new Response(image, {
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "image/webp",
        "Cache-Control":
          "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    return new Response("Failed to fetch project preview", { status: 500 });
  }
}
