/**
 * resources.ts
 * -----------------------------------------------------------------------------
 * MCP Resources: 함수 호출 없이 "읽기"만 하는 정적/반정적 데이터.
 * Claude는 대화 중 필요하다고 판단되면 이 Resource들을 자동으로 읽어 맥락에 활용합니다.
 * (사용자가 명시적으로 "리소스 읽어줘"라고 말할 필요는 없습니다 — Tool과 달리
 *  "무엇을 조회할지"가 고정되어 있는 배경지식/문서 성격의 데이터에 적합합니다.)
 */

// 각 Resource는 uri, name, description, mimeType 을 가진다.
export const RESOURCES = [
  {
    uri: "tanium://docs/field-filter-syntax",
    name: "FieldFilter 문법 안내",
    description:
      "Tanium Gateway의 공통 필터 구조(FieldFilter: path/op/value/any/filters) 사용법과 예시",
    mimeType: "text/markdown",
  },
  {
    uri: "tanium://docs/tool-catalog",
    name: "전체 Tool 카탈로그",
    description: "8개 모듈(Asset/Comply/Deploy/Discover/IM/Patch/Reporting/ThreatResponse)의 20개 Tool 목록과 용도 요약",
    mimeType: "text/markdown",
  },
  {
    uri: "tanium://docs/known-limitations",
    name: "알려진 제한사항",
    description: "현재 Tool로 지원하지 않는 항목 목록 (EOL, SLA, 승인워크플로우 등) — Tanium-Task-Area 갭분석 기준",
    mimeType: "text/markdown",
  },
] as const;

const FIELD_FILTER_DOC = `# FieldFilter 문법 안내

Tanium Gateway의 대부분의 목록형 쿼리(assets, cveFindings, discoverInterfaces 등)는
아래와 같은 공통 필터 구조를 사용합니다.

\`\`\`
filter: {
  path: "severityV3"     // dot notation 경로
  op: EQ                  // EQ | CONTAINS | STARTS_WITH | ENDS_WITH | MATCHES | GT | GTE | LT | LTE
  value: "Critical"       // 비교할 값(문자열)
  negated: false          // true면 조건에 맞는 레코드를 "제외"
  any: false              // 복합 필터일 때 true=OR, false(기본)=AND
  filters: [ ... ]        // 복합 필터의 하위 filter 배열
}
\`\`\`

## 자주 쓰는 예시

- Critical 등급만: \`{"path":"severityV3","op":"EQ","value":"Critical"}\`
- CISA KEV만: \`{"path":"isCisaKev","op":"EQ","value":"true"}\`
- 최근 7일 신규 CVE: \`{"path":"firstFound","op":"GTE","value":"2026-07-19"}\`
- 미관리 자산만: \`{"path":"isManaged","op":"EQ","value":"false"}\`
- 복합(OR) 조건: \`{"any": true, "filters": [{"path":"severityV3","op":"EQ","value":"Critical"}, {"path":"isCisaKev","op":"EQ","value":"true"}]}\`
`;

const TOOL_CATALOG_DOC = `# 전체 Tool 카탈로그 (20개)

## Asset
- get_all_assets — 전체 자산 목록 + 상세정보(OS/프로세서/가상화여부)
- get_asset_product_endpoints — 벤더/제품/버전 기준 설치 자산 조회
- get_installed_applications — 설치/실행 중인 애플리케이션 센서 조회

## Comply
- get_compliance_findings — 정책/표준 위반(Compliance) findings
- get_cve_findings — CVE 취약점 findings 전체
- get_filtered_cve_findings — 조건(심각도/CISA KEV/날짜 등) 필터링된 CVE

## Deploy
- get_deploy_packages — 패키지 카탈로그
- get_deployment_status — 배포 진행 상태
- deploy_package_to_group — (기본 비활성) 실제 배포 mutation

## Discover
- get_discover_interfaces — 전체 인터페이스(자산) 목록
- get_unmanaged_interfaces — 미관리 자산만 필터링
- get_discover_labels — 레이블별 관리/미관리 집계

## Integrity Monitor
- get_integrity_monitor_status — 배포 진행 상태
- get_integrity_monitor_monitors — 모니터(스캔 설정) 목록
- get_integrity_monitor_watchlists — 워치리스트(감시 경로) 목록

## Patch
- get_patch_definitions — CVE 기준 패치 카탈로그
- get_patch_deployment — 특정 배포 상세
- get_patch_applicability — 컴퓨터 그룹별 적용 가능 패치

## Reporting
- get_reports — 저장된 보고서 목록
- get_report_result_data — 보고서 실제 결과 데이터

## Threat Response
- get_endpoint_threat_alerts — Direct Connect 통한 알림 조회
- resolve_threat_alert — (쓰기) 알림 해결 처리
`;

const KNOWN_LIMITATIONS_DOC = `# 알려진 제한사항 (Tanium-Task-Area 갭분석 기준)

다음 항목은 현재 Tool로 지원하지 않습니다. 관련 질문을 받으면 임의로 추정하지 말고
"현재 연동된 Tool로는 조회할 수 없다"고 안내하세요.

- 자산 생애주기(신규 30일 / 비활성 6개월) — 마지막 통신일자 필드 없음
- EOL(기술지원 종료) 예정일 — 관련 필드 없음
- 자산 중요도(상/중/하) 커스텀 등급
- 통합 리스크 스코어, 부서별 대시보드 (부서 필드 없음)
- 클라우드 워크로드 태그 (Discover의 cloudTags/cloudInstances는 Deprecated, 항상 빈 값)
- 패치 SLA, 승인 워크플로우, 자동 롤백/차단리스트/연기 정책
- 패치 제거(Uninstall), 특정 KB 배포 생성
- Netstat(활성 연결), 네트워크 어댑터/와이파이 상태, 오픈 포트 — 아직 미구현(추가 가능)
- SelfService Portal, Application Control, Disk Encryption, Device Control, Remote Control,
  Notification, WOL, MDM, Device Provisioning — 전 영역 Tool 범위 밖
`;

const RESOURCE_CONTENT: Record<string, string> = {
  "tanium://docs/field-filter-syntax": FIELD_FILTER_DOC,
  "tanium://docs/tool-catalog": TOOL_CATALOG_DOC,
  "tanium://docs/known-limitations": KNOWN_LIMITATIONS_DOC,
};

export function readResourceContent(uri: string): string {
  const content = RESOURCE_CONTENT[uri];
  if (!content) {
    throw new Error(`알 수 없는 Resource URI: ${uri}`);
  }
  return content;
}
