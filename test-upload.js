const fs = require('fs');

async function testUpload() {
  try {
    const fileName = `test_${Date.now()}.jpg`;
    
    // Create a tiny 1x1 white pixel base64 jpeg
    const base64Data = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
    const buffer = Buffer.from(base64Data, 'base64');
    
    const bucket = "design-qa-board.firebasestorage.app";
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?name=${encodeURIComponent(fileName)}`;
    
    console.log("Uploading to:", uploadUrl);
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
      },
      body: buffer,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Firebase REST API error:", response.status, errorText);
    } else {
      const data = await response.json();
      console.log("Success!", data);
    }
  } catch (error) {
    console.error("Upload error:", error);
  }
}

testUpload();
