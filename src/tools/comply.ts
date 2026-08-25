import { gqlRequest } from "../tanium-client.js";
import {
  Q_COMPLY_GET_COMPLIANCE_FINDINGS,
  Q_COMPLY_GET_CVE_FINDINGS,
  Q_COMPLY_GET_FILTERED_CVE_FINDINGS,
} from "../queries.js";

/** 컴플라이언스(정책 위반) findings 조회 */
export const getComplianceFindingsTool = {
  name: "get_compliance_findings",
  description:
    "엔드포인트의 보안 정책/표준(Compliance) 위반 findings를 조회합니다 (카테고리, 표준, 규칙, 상태 포함). (업무요건: 패치 준수율/컴플라이언스)",
  inputSchema: {
    type: "object",
    properties: {
      first: { type: "number", description: "조회할 자산 수 (기본 20)" },
    },
  },
  handler: async (args: { first?: number }) => {
    const data = await gqlRequest<any>(Q_COMPLY_GET_COMPLIANCE_FINDINGS, {
      first: args.first ?? 20,
    });
    return data.endpoints.edges.map((e: any) => ({
      name: e.node.name,
      ipAddress: e.node.ipAddress,
      findings: e.node.compliance.complianceFindings,
    }));
  },
};

/** CVE 취약점 findings 전체 조회 (CVSS v3 + CISA KEV) */
export const getCveFindingsTool = {
  name: "get_cve_findings",
  description:
    "엔드포인트의 CVE 취약점 findings를 조회합니다 (CVSS v3 점수/심각도, CISA KEV 포함 여부 포함). (업무요건: 오픈소스 취약점, 자산-취약점 연계)",
  inputSchema: {
    type: "object",
    properties: {
      first: { type: "number", description: "조회할 자산 수 (기본 20)" },
    },
  },
  handler: async (args: { first?: number }) => {
    const data = await gqlRequest<any>(Q_COMPLY_GET_CVE_FINDINGS, {
      first: args.first ?? 20,
    });
    return data.endpoints.edges.map((e: any) => ({
      name: e.node.name,
      ipAddress: e.node.ipAddress,
      cveFindings: e.node.compliance.cveFindings,
    }));
  },
};

/**
 * 조건(연도/심각도/CISA KEV 등)으로 필터링된 CVE findings 조회.
 * filter는 Gateway의 실제 FieldFilter 구조({path, op, value, any, filters})를 그대로 받습니다.
 *
 * 예) Critical 등급만: { path: "severityV3", op: "EQ", value: "Critical" }
 * 예) CISA KEV만: { path: "isCisaKev", op: "EQ", value: "true" }
 * 예) 최근 7일 신규 CVE: { path: "firstFound", op: "GTE", value: "2026-07-19" }
 */
export const getFilteredCveFindingsTool = {
  name: "get_filtered_cve_findings",
  description:
    "특정 조건(cveYear, severity, isCisaKev, firstFound 등)으로 필터링한 CVE 취약점 findings를 조회합니다. filter 파라미터는 Tanium Gateway의 FieldFilter 형식을 그대로 사용합니다. (업무요건: Critical 취약점, CISA KEV, 최근 N일 신규 CVE)",
  inputSchema: {
    type: "object",
    properties: {
      first: { type: "number", description: "조회할 자산 수 (기본 20)" },
      filter: {
        type: "object",
        description:
          '예: {"path":"severityV3","op":"EQ","value":"Critical"} 또는 {"any":true,"filters":[...]}',
      },
    },
    required: ["filter"],
  },
  handler: async (args: { first?: number; filter: Record<string, unknown> }) => {
    const data = await gqlRequest<any>(Q_COMPLY_GET_FILTERED_CVE_FINDINGS, {
      first: args.first ?? 20,
      filter: args.filter,
    });
    return data.endpoints.edges.map((e: any) => ({
      name: e.node.name,
      ipAddress: e.node.ipAddress,
      cveFindings: e.node.compliance.cveFindings,
    }));
  },
};

export const complyTools = [getComplianceFindingsTool, getCveFindingsTool, getFilteredCveFindingsTool];
