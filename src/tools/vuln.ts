import { gqlRequest } from "../tanium-client.js";
import { Q_CRITICAL_CVE_ASSETS } from "../queries.js";

export const criticalCveTool = {
  name: "get_critical_cve_assets",
  description:
    "Critical 등급 CVE 취약점이 발견된 자산 목록을 조회합니다. (업무요건 4장)",
  inputSchema: {
    type: "object" as const,
    properties: {
      perPage: { type: "number", description: "페이지당 자산 수 (기본 50)" },
    },
  },
  handler: async (args: Record<string, unknown>) => {
    const perPage = typeof args.perPage === "number" ? args.perPage : 50;
    const data = await gqlRequest<{ assets: { items: unknown[] } }>(
      Q_CRITICAL_CVE_ASSETS,
      { perPage, page: 1 }
    );
    return data.assets.items;
  },
};
