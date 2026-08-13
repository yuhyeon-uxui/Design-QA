import { app } from '@/lib/firebase';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { fileName, base64 } = await request.json();
    const storage = getStorage(app);
    const storageRef = ref(storage, fileName);
    
    // Upload the base64 string to Firebase Storage from the server
    await uploadString(storageRef, base64, 'data_url');
    const downloadUrl = await getDownloadURL(storageRef);
    
    return NextResponse.json({ url: downloadUrl });
  } catch (error: any) {
    console.error("Server upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
