require('dotenv').config({ path: '.env.local' });
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

const client = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

async function main() {
  try {
    const propertyId = process.env.GA_PROPERTY_ID;
    console.log("Property ID:", propertyId);
    console.log("Email:", process.env.GOOGLE_CLIENT_EMAIL);
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' }
      ],
    });
    console.log("Success! Data:");
    console.log(JSON.stringify(response.rows, null, 2));
  } catch (e) {
    console.error("Error:", e);
  }
}

main();
