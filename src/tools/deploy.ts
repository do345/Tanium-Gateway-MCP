import { gqlRequest } from "../tanium-client.js";
import {
  Q_DEPLOY_GET_PACKAGES,
  Q_DEPLOY_GET_DEPLOYMENT_STATUS,
  M_DEPLOY_MANAGE_SOFTWARE,
} from "../queries.js";

/** Deploy 패키지 카탈로그 조회 */
export const getDeployPackagesTool = {
  name: "get_deploy_packages",
  description:
    "Deploy 솔루션에 등록된 소프트웨어 패키지 카탈로그를 조회합니다 (제품명/벤더/버전/적용 가능 대수 포함). (업무요건: 패치/SW 배포 현황)",
  inputSchema: { type: "object", properties: {} },
  handler: async () => {
    const data = await gqlRequest<any>(Q_DEPLOY_GET_PACKAGES);
    return data.softwarePackages.edges.map((e: any) => e.node);
  },
};

/** 소프트웨어 배포 진행 상태 조회 */
export const getDeploymentStatusTool = {
  name: "get_deployment_status",
  description:
    "소프트웨어 배포(deployment)의 진행 상태를 조회합니다 (완료/실패/대기/다운로드중 건수). ID 미지정 시 전체 배포 상태를 반환합니다. (업무요건: 패치 배포 성공률)",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "조회할 배포 ID (미지정 시 전체 조회)" },
    },
  },
  handler: async (args: { id?: string }) => {
    const data = await gqlRequest<any>(Q_DEPLOY_GET_DEPLOYMENT_STATUS, { id: args.id });
    return data.softwareDeployment;
  },
};

/**
 * ⚠️ 쓰기 동작(mutation) — 실제로 지정한 컴퓨터 그룹에 패키지를 배포합니다.
 * 이 Tool은 기본적으로 비활성화 상태로 두고, 운영 담당자가 명시적으로 활성화를 요청할 때만
 * index.ts의 TOOLS 배열에 포함시키는 것을 권장합니다 (실수로 인한 대량 배포 방지).
 */
export const deployPackageTool = {
  name: "deploy_package_to_group",
  description:
    "지정한 컴퓨터 그룹에 소프트웨어 패키지를 배포합니다. 이 작업은 되돌릴 수 없는 실제 배포이므로, 반드시 사용자에게 대상 그룹/패키지/일정을 재확인한 후 호출하세요. (업무요건: 패치 배포)",
  inputSchema: {
    type: "object",
    properties: {
      packageId: { type: "number", description: "배포할 패키지 ID" },
      group: { type: "string", description: "대상 컴퓨터 그룹 이름 (예: Corporate Systems)" },
      start: { type: "string", description: "배포 시작 시각 (ISO 8601, 예: 2026-08-01T00:00:00Z)" },
      end: { type: "string", description: "배포 종료 시각 (ISO 8601)" },
    },
    required: ["packageId", "group"],
  },
  handler: async (args: { packageId: number; group: string; start?: string; end?: string }) => {
    const data = await gqlRequest<any>(M_DEPLOY_MANAGE_SOFTWARE, {
      packageId: args.packageId,
      group: args.group,
      start: args.start,
      end: args.end,
    });
    return data.manageSoftware;
  },
};

// 기본 노출 Tool 목록 (읽기 전용). deployPackageTool은 필요 시에만 명시적으로 추가하세요.
export const deployTools = [getDeployPackagesTool, getDeploymentStatusTool];
// 배포(쓰기) 기능이 필요한 경우:
// export const deployTools = [getDeployPackagesTool, getDeploymentStatusTool, deployPackageTool];
