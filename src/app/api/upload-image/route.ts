import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { fileName, base64 } = await request.json();
    
    // Convert base64 to buffer
    const base64Data = base64.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    const bucket = "design-qa-board.firebasestorage.app";
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?name=${encodeURIComponent(fileName)}`;
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
      },
      body: buffer,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Firebase REST API error:", errorText);
      return NextResponse.json({ error: 'REST API Upload failed' }, { status: response.status });
    }
    
    const data = await response.json();
    const downloadToken = data.downloadTokens;
    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(fileName)}?alt=media&token=${downloadToken}`;
    
    return NextResponse.json({ url: downloadUrl });
  } catch (error: any) {
    console.error("Server upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
