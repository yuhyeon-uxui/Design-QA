"use server";

import { getGA4Metrics } from "@/lib/ga4";

export async function fetchAnalyticsData() {
  return await getGA4Metrics();
}
