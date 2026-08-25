import { gqlRequest } from "../tanium-client.js";
import { Q_IM_GET_STATUS, Q_IM_GET_MONITORS, Q_IM_GET_WATCHLISTS } from "../queries.js";

/** Integrity Monitor 배포 상태(모니터/워치리스트 배포 진행 여부) 조회 */
export const getIMStatusTool = {
  name: "get_integrity_monitor_status",
  description:
    "Integrity Monitor의 모니터/워치리스트 배포가 현재 진행 중인지 상태를 조회합니다. (업무요건: 무결성 모니터링 운영 현황)",
  inputSchema: { type: "object", properties: {} },
  handler: async () => {
    const data = await gqlRequest<any>(Q_IM_GET_STATUS);
    return data.integrityMonitorStatus;
  },
};

/** Integrity Monitor 모니터(스캔 설정) 목록 조회 */
export const getIMMonitorsTool = {
  name: "get_integrity_monitor_monitors",
  description:
    "Integrity Monitor 모니터(엔드포인트별 스캔 설정, 우선순위, 대상 컴퓨터 그룹) 목록을 조회합니다. (업무요건: 무결성 모니터링 정책 현황)",
  inputSchema: {
    type: "object",
    properties: {
      first: { type: "number", description: "조회할 모니터 수 (기본 20, 최대 50)" },
    },
  },
  handler: async (args: { first?: number }) => {
    const data = await gqlRequest<any>(Q_IM_GET_MONITORS, { first: args.first ?? 20 });
    return {
      totalRecords: data.integrityMonitorMonitors.totalRecords,
      monitors: data.integrityMonitorMonitors.edges.map((e: any) => e.node),
    };
  },
};

/** Integrity Monitor 워치리스트(감시 대상 경로) 목록 조회 */
export const getIMWatchlistsTool = {
  name: "get_integrity_monitor_watchlists",
  description:
    "Integrity Monitor 워치리스트(감시 대상 파일/디렉터리/레지스트리 경로) 목록을 조회합니다. (업무요건: 무결성 변경 감시 대상 현황)",
  inputSchema: {
    type: "object",
    properties: {
      first: { type: "number", description: "조회할 워치리스트 수 (기본 20)" },
    },
  },
  handler: async (args: { first?: number }) => {
    const data = await gqlRequest<any>(Q_IM_GET_WATCHLISTS, { first: args.first ?? 20 });
    return data.integrityMonitorWatchlists.edges.map((e: any) => e.node);
  },
};

export const integrityMonitorTools = [getIMStatusTool, getIMMonitorsTool, getIMWatchlistsTool];
