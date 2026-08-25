import { gqlRequest } from "../tanium-client.js";
import {
  M_TR_OPEN_CONNECTION,
  Q_TR_GET_ENDPOINT_ALERTS,
  M_TR_RESOLVE_ALERT,
} from "../queries.js";

/**
 * Threat Response는 Direct Connect를 통해 "연결을 먼저 연 뒤" 데이터를 조회하는 구조입니다.
 * 이 Tool은 사용성을 위해 ①연결 열기 → ②알림 조회 두 단계를 한 번의 Tool 호출로 묶어 처리합니다.
 * 연결은 5분간 미사용 시 자동으로 닫히므로 별도의 종료 처리는 하지 않습니다.
 */
export const getEndpointAlertsTool = {
  name: "get_endpoint_threat_alerts",
  description:
    "특정 엔드포인트의 Threat Response 알림(성능/이상 탐지 alert)을 조회합니다. 내부적으로 Direct Connect 연결을 연 뒤 최근 24시간 alert를 가져옵니다. (업무요건: 제로데이/이상탐지 이력)",
  inputSchema: {
    type: "object",
    properties: {
      endpointId: {
        type: "string",
        description: "대상 엔드포인트 ID (EID). get_all_assets 등으로 얻은 computerID를 사용하세요.",
      },
    },
    required: ["endpointId"],
  },
  handler: async (args: { endpointId: string }) => {
    // 1단계: Direct Connect 연결 열기
    const openResult = await gqlRequest<any>(M_TR_OPEN_CONNECTION, { id: args.endpointId });
    const connectionID = openResult.directConnectOpen.connectionID;
    const status = openResult.directConnectOpen.status;

    if (status !== "READY") {
      return {
        connectionID,
        status,
        note: "연결이 아직 READY 상태가 아닙니다. 잠시 후 재시도하거나 directConnectConnectionStatus로 상태를 확인하세요.",
      };
    }

    // 2단계: 알림(alert) 조회
    const alertsResult = await gqlRequest<any>(Q_TR_GET_ENDPOINT_ALERTS, { id: connectionID });
    return {
      connectionID,
      alerts: alertsResult.directConnectEndpoint.alerts.all,
    };
  },
};

/** 특정 Threat Response 알림을 해결됨(Resolved) 상태로 변경 */
export const resolveAlertTool = {
  name: "resolve_threat_alert",
  description:
    "특정 Threat Response 알림(GUID)을 해결됨(Resolved) 상태로 변경합니다. ⚠️ 상태를 되돌릴 수 없으니 사용자 확인 후 호출하세요. (업무요건: 위협 대응 처리)",
  inputSchema: {
    type: "object",
    properties: {
      guid: { type: "string", description: "해결 처리할 알림의 GUID" },
    },
    required: ["guid"],
  },
  handler: async (args: { guid: string }) => {
    const data = await gqlRequest<any>(M_TR_RESOLVE_ALERT, { guid: args.guid });
    return data.threatResponseAlertResolve;
  },
};

export const threatResponseTools = [getEndpointAlertsTool, resolveAlertTool];
