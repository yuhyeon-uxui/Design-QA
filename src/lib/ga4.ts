import { BetaAnalyticsDataClient } from '@google-analytics/data';

const propertyId = process.env.GA_PROPERTY_ID;

const client = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

export async function getGA4Metrics() {
  if (!propertyId || !process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.warn("GA4 credentials are missing.");
    return {
      activeUsers: 0,
      sessions: 0,
      bounceRate: 0,
      averageSessionDuration: 0,
    };
  }

  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
      ],
    });

    const rows = response.rows;
    if (!rows || rows.length === 0) {
      return {
        activeUsers: 0,
        sessions: 0,
        bounceRate: 0,
        averageSessionDuration: 0,
      };
    }

    const metricValues = rows[0].metricValues;
    return {
      activeUsers: parseInt(metricValues?.[0]?.value || '0'),
      sessions: parseInt(metricValues?.[1]?.value || '0'),
      bounceRate: parseFloat(metricValues?.[2]?.value || '0') * 100, // GA returns ratio e.g. 0.45 for 45%
      averageSessionDuration: parseFloat(metricValues?.[3]?.value || '0'), // In seconds
    };
  } catch (error) {
    console.error("Error fetching GA4 metrics:", error);
    return {
      activeUsers: 0,
      sessions: 0,
      bounceRate: 0,
      averageSessionDuration: 0,
    };
  }
}
