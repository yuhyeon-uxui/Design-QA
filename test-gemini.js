require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function main() {
  try {
    const key = process.env.GEMINI_API_KEY;
    console.log("Key starts with:", key.substring(0, 10));
    
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent("Hello! Say 'Testing Gemini API'.");
    console.log("Success! Response:");
    console.log(result.response.text());
  } catch (e) {
    console.error("Error:", e);
  }
}

main();
