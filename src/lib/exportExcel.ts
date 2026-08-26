import ExcelJS from "exceljs";

export async function exportMetricsToExcel(metrics: any) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("User Metrics");

  // Add Headers
  sheet.columns = [
    { header: "Metric", key: "metric", width: 25 },
    { header: "Value", key: "value", width: 15 },
    { header: "Description", key: "desc", width: 30 },
  ];

  // Make header bold
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E7FF' } };

  // Basic Metrics
  sheet.addRow({ metric: "활성 사용자 수", value: `${metrics.activeUsers}명`, desc: "최근 30일 접속 유저" });
  sheet.addRow({ metric: "총 세션 수", value: `${metrics.sessions}회`, desc: "총 방문 횟수" });
  sheet.addRow({ metric: "평균 이탈률", value: `${metrics.bounceRate.toFixed(1)}%`, desc: "페이지 진입 후 바로 이탈한 비율" });
  sheet.addRow({ metric: "평균 체류시간", value: `${Math.floor(metrics.averageSessionDuration / 60)}분 ${Math.floor(metrics.averageSessionDuration % 60)}초`, desc: "유저당 평균 머문 시간" });
  
  sheet.addRow({});
  
  // Devices
  sheet.addRow({ metric: "--- 기기별 비율 ---", value: "", desc: "" });
  metrics.devices.forEach((d: any) => {
    sheet.addRow({ metric: d.name, value: `${d.value}명`, desc: "활성 사용자 기준" });
  });

  sheet.addRow({});
  
  // Top Pages
  sheet.addRow({ metric: "--- 인기 페이지 Top ---", value: "", desc: "" });
  metrics.topPages.forEach((p: any, i: number) => {
    sheet.addRow({ metric: `${i + 1}. ${p.title}`, value: `${p.views} views`, desc: p.path });
  });

  sheet.addRow({});
  
  // AI Insight
  sheet.addRow({ metric: "--- AI 분석 리포트 ---", value: "", desc: "" });
  const insightRow = sheet.addRow({ metric: metrics.insight, value: "", desc: "" });
  insightRow.height = 60; // Make room for multiline
  sheet.getCell(`A${insightRow.number}`).alignment = { wrapText: true, vertical: 'top' };
  sheet.mergeCells(`A${insightRow.number}:C${insightRow.number}`);

  // Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = window.URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `User_Metrics_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
}
