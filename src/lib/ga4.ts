import { BetaAnalyticsDataClient } from '@google-analytics/data';

const propertyId = process.env.GA_PROPERTY_ID;

const client = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

export async function getGA4Metrics() {
  const fallback = {
    activeUsers: 0,
    sessions: 0,
    bounceRate: 0,
    averageSessionDuration: 0,
    devices: [],
    topPages: [],
  };

  if (!propertyId || !process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.warn("GA4 credentials are missing.");
    return fallback;
  }

  try {
    const commonRequest = {
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    };

    // 1. Basic Metrics
    const [basicResponse] = await client.runReport({
      ...commonRequest,
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
      ],
    });

    // 2. Device Breakdown
    const [deviceResponse] = await client.runReport({
      ...commonRequest,
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [{ name: 'activeUsers' }],
    });

    // 3. Top Pages
    const [pageResponse] = await client.runReport({
      ...commonRequest,
      dimensions: [{ name: 'pageTitle' }, { name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 5,
    });

    const basicRows = basicResponse.rows;
    let basicData = { activeUsers: 0, sessions: 0, bounceRate: 0, averageSessionDuration: 0 };
    
    if (basicRows && basicRows.length > 0) {
      const vals = basicRows[0].metricValues;
      basicData = {
        activeUsers: parseInt(vals?.[0]?.value || '0'),
        sessions: parseInt(vals?.[1]?.value || '0'),
        bounceRate: parseFloat(vals?.[2]?.value || '0') * 100,
        averageSessionDuration: parseFloat(vals?.[3]?.value || '0'),
      };
    }

    const devices = (deviceResponse.rows || []).map(row => ({
      name: row.dimensionValues?.[0]?.value || 'Unknown',
      value: parseInt(row.metricValues?.[0]?.value || '0'),
    }));

    const topPages = (pageResponse.rows || []).map(row => ({
      title: row.dimensionValues?.[0]?.value || 'Unknown',
      path: row.dimensionValues?.[1]?.value || '/',
      views: parseInt(row.metricValues?.[0]?.value || '0'),
    }));

    return {
      ...basicData,
      devices,
      topPages,
    };
  } catch (error) {
    console.error("Error fetching GA4 metrics:", error);
    return fallback;
  }
}
