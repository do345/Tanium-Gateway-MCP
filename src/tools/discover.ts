import { gqlRequest } from "../tanium-client.js";
import {
  Q_DISCOVER_GET_INTERFACES,
  FILTER_DISCOVER_UNMANAGED,
  Q_DISCOVER_GET_LABELS,
} from "../queries.js";

/** Discover로 발견된 전체 인터페이스(자산) 목록 조회 */
export const getDiscoverInterfacesTool = {
  name: "get_discover_interfaces",
  description:
    "Discover 네트워크 스캔으로 발견된 인터페이스(자산) 목록을 조회합니다. isManaged 값으로 Tanium 관리 여부를 확인할 수 있습니다. (업무요건: 전산화 수준, Tanium 관리 비율)",
  inputSchema: {
    type: "object",
    properties: {
      first: { type: "number", description: "조회할 인터페이스 수 (기본 50)" },
    },
  },
  handler: async (args: { first?: number }) => {
    const data = await gqlRequest<any>(Q_DISCOVER_GET_INTERFACES, {
      first: args.first ?? 50,
      filter: undefined,
    });
    return {
      totalRecords: data.discoverInterfaces.totalRecords,
      interfaces: data.discoverInterfaces.edges.map((e: any) => e.node),
    };
  },
};

/** 미관리(Unmanaged) 자산만 조회 */
export const getUnmanagedInterfacesTool = {
  name: "get_unmanaged_interfaces",
  description:
    "Tanium 에이전트가 설치되지 않은 미관리(Unmanaged) 자산 목록만 조회합니다. (업무요건: 미관리 자산 목록)",
  inputSchema: {
    type: "object",
    properties: {
      first: { type: "number", description: "조회할 인터페이스 수 (기본 50)" },
    },
  },
  handler: async (args: { first?: number }) => {
    const data = await gqlRequest<any>(Q_DISCOVER_GET_INTERFACES, {
      first: args.first ?? 50,
      filter: FILTER_DISCOVER_UNMANAGED,
    });
    return {
      totalRecords: data.discoverInterfaces.totalRecords,
      unmanagedInterfaces: data.discoverInterfaces.edges.map((e: any) => e.node),
    };
  },
};

/** Discover 레이블별 관리/미관리 자산 집계 (전산화 수준 대시보드용) */
export const getDiscoverLabelsTool = {
  name: "get_discover_labels",
  description:
    "Discover 레이블(태그)별 관리(managed)/미관리(unmanaged) 자산 수 집계를 조회합니다. Tanium 관리 비율 대시보드를 만들 때 유용합니다. (업무요건: 전산화 수준)",
  inputSchema: {
    type: "object",
    properties: {
      first: { type: "number", description: "조회할 레이블 수 (기본 20)" },
    },
  },
  handler: async (args: { first?: number }) => {
    const data = await gqlRequest<any>(Q_DISCOVER_GET_LABELS, { first: args.first ?? 20 });
    return data.discoverLabels.edges.map((e: any) => e.node);
  },
};

export const discoverTools = [getDiscoverInterfacesTool, getUnmanagedInterfacesTool, getDiscoverLabelsTool];
