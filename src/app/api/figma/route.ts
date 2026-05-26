import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "Figma URL is required." }, { status: 400 });
    }

    // Parse Figma URL
    // Examples:
    // https://www.figma.com/file/FILE_KEY/title?node-id=1:2
    // https://www.figma.com/design/FILE_KEY/title?node-id=1-23
    const match = url.match(/figma\.com\/(file|design)\/([^\/]+)\/.*node-id=([^&]+)/);
    
    if (!match) {
      return NextResponse.json({ error: "Invalid Figma URL format. Please make sure to include the node-id." }, { status: 400 });
    }

    const fileKey = match[2];
    let nodeId = match[3];
    
    // Figma API requires node IDs to use ':' instead of '-', but URLs often use '-'
    nodeId = nodeId.replace('-', ':');

    const figmaToken = process.env.FIGMA_ACCESS_TOKEN;
    if (!figmaToken) {
      return NextResponse.json({ error: "Figma Access Token is not configured on the server." }, { status: 500 });
    }

    // Call Figma API
    const response = await fetch(`https://api.figma.com/v1/images/${fileKey}?ids=${nodeId}`, {
      headers: {
        "X-Figma-Token": figmaToken,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: `Figma API Error: ${errorData.err}` }, { status: response.status });
    }

    const data = await response.json();
    const imageUrl = data.images[nodeId];

    if (!imageUrl) {
      return NextResponse.json({ error: "Could not render image for the given node." }, { status: 404 });
    }

    return NextResponse.json({ imageUrl });

  } catch (error) {
    console.error("Figma API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
