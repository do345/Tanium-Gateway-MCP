import { gqlRequest } from "../tanium-client.js";
import {
  Q_PATCH_GET_DEFINITIONS,
  Q_PATCH_GET_DEPLOYMENT,
  Q_PATCH_GET_APPLICABILITY,
} from "../queries.js";

/** CVE ID 등으로 패치 정의(카탈로그) 검색 */
export const getPatchDefinitionsTool = {
  name: "get_patch_definitions",
  description:
    "CVE ID 등의 조건으로 Patch 정의(패치 카탈로그)를 검색합니다 (심각도, 릴리즈일, 슈퍼시드 여부 포함). (업무요건: EOL/패치 대응)",
  inputSchema: {
    type: "object",
    properties: {
      first: { type: "number", description: "조회할 패치 정의 수 (기본 10)" },
      cveId: { type: "string", description: "필터링할 단일 CVE ID (예: CVE-2014-123456)" },
    },
  },
  handler: async (args: { first?: number; cveId?: string }) => {
    const data = await gqlRequest<any>(Q_PATCH_GET_DEFINITIONS, {
      first: args.first ?? 10,
      filter: args.cveId ? { cveIds: [args.cveId] } : undefined,
      sort: { field: "releaseDate", order: "desc" },
    });
    return {
      totalRecords: data.patchDefinitions.totalRecords,
      definitions: data.patchDefinitions.edges.map((e: any) => e.node),
    };
  },
};

/** 특정 Patch 배포(deployment) 상세 상태 조회 */
export const getPatchDeploymentTool = {
  name: "get_patch_deployment",
  description:
    "특정 ID의 Patch 배포(deployment) 상세 정보(대상 그룹, 일정, 상태, 재시작 여부 등)를 조회합니다. (업무요건: 패치 배포 현황)",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "조회할 Patch 배포 ID" },
    },
    required: ["id"],
  },
  handler: async (args: { id: string }) => {
    const data = await gqlRequest<any>(Q_PATCH_GET_DEPLOYMENT, { id: args.id });
    return data.patchDeployment;
  },
};

/** 특정 컴퓨터 그룹에 적용 가능한 패치(applicability) 조회 */
export const getPatchApplicabilityTool = {
  name: "get_patch_applicability",
  description:
    "지정한 컴퓨터 그룹에 적용 가능한 패치 목록을 센서 기반으로 조회합니다. (업무요건: 패치 적용 대상 파악)",
  inputSchema: {
    type: "object",
    properties: {
      computerGroup: { type: "string", description: "컴퓨터 그룹 이름 (예: Corporate Systems)" },
    },
    required: ["computerGroup"],
  },
  handler: async (args: { computerGroup: string }) => {
    const data = await gqlRequest<any>(Q_PATCH_GET_APPLICABILITY, { cg: args.computerGroup });
    return {
      totalRecords: data.endpoints.totalRecords,
      endpoints: data.endpoints.edges.map((e: any) => e.node),
    };
  },
};

export const patchTools = [getPatchDefinitionsTool, getPatchDeploymentTool, getPatchApplicabilityTool];
