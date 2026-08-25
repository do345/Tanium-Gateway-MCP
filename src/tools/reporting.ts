import { gqlRequest } from "../tanium-client.js";
import { Q_REPORTING_GET_REPORTS, Q_REPORTING_GET_REPORT_RESULT_DATA } from "../queries.js";

/** 저장된 Report(보고서) 목록 조회 */
export const getReportsTool = {
  name: "get_reports",
  description:
    "Tanium Reporting 솔루션에 저장된 보고서(Report) 목록을 조회합니다 (이름, 모듈, 작성자, 라벨, 수정일 포함). (업무요건: 정기 보고/대시보드 현황 파악)",
  inputSchema: {
    type: "object",
    properties: {
      first: { type: "number", description: "조회할 보고서 수 (기본 20)" },
      text: { type: "string", description: "보고서 이름/설명에 포함된 검색어" },
      moduleName: { type: "string", description: "특정 모듈 이름으로 필터 (예: Comply, Patch)" },
    },
  },
  handler: async (args: { first?: number; text?: string; moduleName?: string }) => {
    const filter: Record<string, unknown> = {};
    if (args.text) filter.text = args.text;
    if (args.moduleName) filter.moduleNames = [args.moduleName];
    const data = await gqlRequest<any>(Q_REPORTING_GET_REPORTS, {
      first: args.first ?? 20,
      filter: Object.keys(filter).length ? filter : undefined,
    });
    return data.reports.edges.map((e: any) => e.node);
  },
};

/** 특정 Report의 실제 결과 데이터 조회 */
export const getReportResultDataTool = {
  name: "get_report_result_data",
  description:
    "특정 보고서(Report) ID의 실제 결과 데이터(행/열 값)를 조회합니다. (업무요건: 보고서 데이터 추출 및 자동화)",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "조회할 보고서 ID" },
      first: { type: "number", description: "조회할 결과 행 수 (기본 50, 최대 5000)" },
    },
    required: ["id"],
  },
  handler: async (args: { id: string; first?: number }) => {
    const data = await gqlRequest<any>(Q_REPORTING_GET_REPORT_RESULT_DATA, {
      id: args.id,
      first: args.first ?? 50,
      summarize: true,
    });
    return {
      totalRecords: data.reportResultData.totalRecords,
      columns: data.reportResultData.viewDetails.columns,
      rows: data.reportResultData.edges.map((e: any) => ({
        values: e.node.columns,
        count: e.node.count,
      })),
    };
  },
};

export const reportingTools = [getReportsTool, getReportResultDataTool];
