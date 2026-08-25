/**
 * prompts.ts
 * -----------------------------------------------------------------------------
 * MCP Prompts: 사용자가 클라이언트 UI에서 "선택"해서 실행하는 정형화된 질의 템플릿.
 * (Claude Desktop 등에서 "/" 를 입력하면 나타나는 슬래시 명령과 유사하게 동작합니다.)
 * Tool과 달리 Prompt는 "이번에 무엇을 물어볼지"를 사용자가 고르는 진입점 역할을 합니다.
 */

export const PROMPTS = [
  {
    name: "weekly_vuln_report",
    description: "이번 주 신규 Critical CVE + CISA KEV 현황을 요약 리포트로 정리",
    arguments: [
      {
        name: "days",
        description: "최근 며칠 이내 신규 CVE를 포함할지 (기본 7)",
        required: false,
      },
    ],
  },
  {
    name: "patch_compliance_snapshot",
    description: "전체 자산의 패치 준수율(Compliance Rate) 스냅샷 + 개선 필요 자산 정리",
    arguments: [],
  },
  {
    name: "asset_classification_report",
    description: "전체 자산을 서버/가상화/물리 등으로 분류하고 관리 비율(Discover)까지 종합",
    arguments: [],
  },
] as const;

/**
 * 각 Prompt가 실제로 Claude에게 전달할 "지시문"을 구성한다.
 * (여기서 Tool을 직접 호출하지 않는다 — 어떤 Tool을 어떤 순서로 호출할지
 *  자연어로 안내하면, 이어서 Claude가 실제 Tool 호출을 수행한다.)
 */
export function buildPromptMessages(name: string, args: Record<string, string>) {
  switch (name) {
    case "weekly_vuln_report": {
      const days = args.days ?? "7";
      return [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text:
              `get_filtered_cve_findings Tool을 사용해서 최근 ${days}일 이내 발견된(firstFound 기준) ` +
              `CVE를 조회하고, isCisaKev가 true인 항목은 별도로 강조해줘. ` +
              `자산별로 그룹핑해서 표로 정리하고, 가장 시급한 3건에 대한 대응 우선순위를 제안해줘.`,
          },
        },
      ];
    }

    case "patch_compliance_snapshot": {
      return [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text:
              "get_compliance_findings Tool로 전체 자산의 컴플라이언스 상태(state)를 조회해서 " +
              "Pass/Fail 비율을 계산해줘. Fail 상태인 자산은 표준(standard)/규칙(rule)별로 그룹핑해서 " +
              "어떤 정책 위반이 가장 많은지 정리해줘.",
          },
        },
      ];
    }

    case "asset_classification_report": {
      return [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text:
              "get_all_assets로 전체 자산을 조회해서 chassisType/isVirtual 기준으로 분류하고, " +
              "get_discover_labels로 Tanium 관리 비율(managed/unmanaged)까지 함께 조회해서 " +
              "자산 현황 종합 요약을 표로 만들어줘. 분류가 애매한 자산은 별도로 표시해줘.",
          },
        },
      ];
    }

    default:
      throw new Error(`알 수 없는 Prompt: ${name}`);
  }
}
