"use server";

import { getGA4Metrics } from "@/lib/ga4";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function fetchAnalyticsData() {
  const metrics = await getGA4Metrics();
  
  let insight = "데이터를 분석하는 중입니다...";

  if (!process.env.GEMINI_API_KEY) {
    insight = "Gemini API Key가 설정되지 않아 AI 분석을 건너뛰었습니다. 환경 변수에 GEMINI_API_KEY를 추가해주세요.";
    return { ...metrics, insight };
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
너는 웹사이트 트래픽 전문 데이터 분석가야.
다음은 지난 30일간의 구글 애널리틱스(GA4) 데이터야.

- 활성 사용자 수: ${metrics.activeUsers}명
- 총 세션 수: ${metrics.sessions}회
- 평균 이탈률: ${metrics.bounceRate.toFixed(1)}%
- 평균 체류시간: ${Math.floor(metrics.averageSessionDuration / 60)}분 ${Math.floor(metrics.averageSessionDuration % 60)}초
- 기기별 비율: ${metrics.devices.map(d => `${d.name}(${d.value}명)`).join(', ')}
- 상위 인기 페이지 Top 3:
${metrics.topPages.slice(0, 3).map((p, i) => `  ${i+1}. ${p.title} (${p.views} views)`).join('\n')}

이 데이터를 바탕으로 현재 웹사이트의 상태를 진단하고, 긍정적인 점 1개와 개선해야 할 점 1개를 합쳐서 **총 3문장 이내의 짧고 명확한 한국어 분석 리포트**를 작성해줘.
    `;

    const result = await model.generateContent(prompt);
    insight = result.response.text();
  } catch (error) {
    console.error("Gemini AI API Error:", error);
    insight = "AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }

  return { ...metrics, insight };
}
