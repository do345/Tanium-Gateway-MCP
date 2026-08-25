import { gqlRequest } from "../tanium-client.js";
import {
  Q_ASSET_GET_RICH_ENDPOINT_DATA,
  Q_ASSET_GET_PRODUCT_ENDPOINTS,
  Q_ASSET_GET_INSTALLED_APPLICATIONS,
} from "../queries.js";

/** 전체 자산 목록 + 상세정보(OS/프로세서/가상화여부) 조회 */
export const getAllAssetsTool = {
  name: "get_all_assets",
  description:
    "Tanium에 등록된 전체 IT자산(엔드포인트) 목록과 상세 정보(OS, 프로세서, 가상화 여부, 도메인 등)를 조회합니다. (업무요건: IT자산 식별·관리)",
  inputSchema: {
    type: "object",
    properties: {
      first: { type: "number", description: "조회할 자산 수 (기본 50)" },
    },
  },
  handler: async (args: { first?: number }) => {
    const data = await gqlRequest<any>(Q_ASSET_GET_RICH_ENDPOINT_DATA, {
      first: args.first ?? 50,
    });
    return {
      totalReturned: data.endpoints.edges.length,
      hasNextPage: data.endpoints.pageInfo.hasNextPage,
      assets: data.endpoints.edges.map((e: any) => e.node),
    };
  },
};

/** 특정 벤더/제품/버전 기준 설치 자산 조회 (Asset 솔루션) */
export const getAssetProductEndpointsTool = {
  name: "get_asset_product_endpoints",
  description:
    "특정 소프트웨어 제품(벤더/제품명/버전)이 설치된 자산 목록을 Asset 솔루션 기준으로 조회합니다. (업무요건: 오픈소스/설치 SW 관리)",
  inputSchema: {
    type: "object",
    properties: {
      first: { type: "number", description: "조회할 자산 수 (기본 20)" },
      vendor: { type: "string", description: "제품 벤더명 (예: Mozilla)" },
      name: { type: "string", description: "제품명 (예: Firefox)" },
      version: { type: "string", description: "제품 버전 (예: 98.0)" },
    },
  },
  handler: async (args: { first?: number; vendor?: string; name?: string; version?: string }) => {
    const data = await gqlRequest<any>(Q_ASSET_GET_PRODUCT_ENDPOINTS, {
      first: args.first ?? 20,
      vendor: args.vendor,
      name: args.name,
      version: args.version,
    });
    return data.assetProductEndpoints.edges.map((e: any) => e.node);
  },
};

/** 설치/실행 중인 애플리케이션(OSS 포함) 센서 조회 */
export const getInstalledApplicationsTool = {
  name: "get_installed_applications",
  description:
    "각 엔드포인트에 설치된 애플리케이션 및 실행 중인 애플리케이션 목록을 조회합니다 (오픈소스 컴포넌트 파악에 활용). (업무요건: 오픈소스 관리)",
  inputSchema: { type: "object", properties: {} },
  handler: async () => {
    const data = await gqlRequest<any>(Q_ASSET_GET_INSTALLED_APPLICATIONS);
    return data.endpoints.edges.map((e: any) => ({
      computerID: e.node.computerID,
      applications: e.node.sensorReadings.columns,
    }));
  },
};

export const assetTools = [getAllAssetsTool, getAssetProductEndpointsTool, getInstalledApplicationsTool];
