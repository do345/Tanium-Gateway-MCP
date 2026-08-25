/**
 * queries.ts
 * -----------------------------------------------------------------------------
 * Tanium Gateway GraphQL 쿼리 모음.
 *
 * 이 파일의 모든 쿼리는 "tanium_gateway_user_guide_for_cloud_reference__gateway_examples"
 * PDF(Tanium Gateway User Guide for Cloud, Reference: Gateway examples)에 실제로 수록된
 * 예제를 기준으로 작성되었습니다. 필드명/구조는 추측이 아니라 문서에 있는 그대로입니다.
 *
 * 공통 필터 구조 (FieldFilter) — Asset/Comply/Discover 등 대부분의 목록형 쿼리에서 공용:
 *   filter: {
 *     path: "cveYear"        // dot notation 경로 (예: "cpu.manufacturer")
 *     op: EQ | CONTAINS | STARTS_WITH | ENDS_WITH | MATCHES | GT | GTE | LT | LTE
 *     value: "2020"           // 비교할 값 (문자열)
 *     negated: false          // true면 조건에 맞는 레코드를 "제외"
 *     any: false              // 복합 필터일 때 true=OR, false(기본)=AND
 *     filters: [ ... ]        // 복합 필터의 하위 filter 배열 (단일 필터에는 사용 불가)
 *   }
 *
 * 참고: 이전 답변(6장 카탈로그)에서 제가 안내했던 FilterSpec { field, op, match, subs }
 * 구조는 실제 스키마 확인 전 "예상"으로 안내드린 것이며, 실제로는 위 FieldFilter
 * { path, op, value, any, filters } 구조가 맞습니다. 이 파일부터는 실제 구조를 사용합니다.
 */

// =====================================================================================
// 1. Asset
// =====================================================================================

/** 자산 목록 + 상세 정보 (OS/프로세서/가상화 여부 등) — 업무요건 1,2,5번 대응 */
export const Q_ASSET_GET_RICH_ENDPOINT_DATA = /* GraphQL */ `
  query GetRichEndpointData($first: Int) {
    endpoints(first: $first) {
      edges {
        node {
          name
          computerID
          ipAddress
          isVirtual
          chassisType
          systemUUID
          domainName
          os {
            name
            platform
            generation
          }
          processor {
            architecture
            cpu
            manufacturer
            speed
          }
          lastLoggedInUser
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
      }
    }
  }
`;

/** 특정 제조사/제품명/버전 기준 Asset 제품 설치 자산 조회 — 업무요건 10번(OSS 목록) 대응 */
export const Q_ASSET_GET_PRODUCT_ENDPOINTS = /* GraphQL */ `
  query GetAssetProductEndpoints($first: Int, $vendor: String, $name: String, $version: String) {
    assetProductEndpoints(first: $first, filter: { vendor: $vendor, name: $name, version: $version }) {
      edges {
        node {
          id
          eid
          computerName
          computerId
          serialNumber
          osPlatform
          operatingSystem
          manufacturer
          ipAddress
          userName
          createdAt
          updatedAt
        }
      }
    }
  }
`;

/** 설치/실행 중인 애플리케이션 센서 조회 — 업무요건 10번(OSS 목록/버전) 대응 */
export const Q_ASSET_GET_INSTALLED_APPLICATIONS = /* GraphQL */ `
  query GetInstalledApplications {
    endpoints {
      edges {
        node {
          computerID
          sensorReadings(sensors: [{ name: "Installed Applications" }]) {
            columns {
              name
              values
              sensor {
                name
              }
            }
          }
        }
      }
    }
  }
`;

// =====================================================================================
// 2. Comply
// =====================================================================================

/** 엔드포인트 컴플라이언스(정책 위반) findings 조회 — 업무요건 19번(패치 준수율) 대응 */
export const Q_COMPLY_GET_COMPLIANCE_FINDINGS = /* GraphQL */ `
  query GetEndpointComplianceFindings($first: Int!) {
    endpoints(first: $first) {
      edges {
        node {
          name
          ipAddress
          compliance {
            complianceFindings {
              category
              excepted
              firstFoundDate
              id
              lastScanDate
              profile
              profileVersion
              rule
              ruleId
              standard
              standardVersion
              state
            }
          }
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasPreviousPage
        hasNextPage
      }
    }
  }
`;

/** CVE 취약점 findings 조회 (CVSS v3 + CISA KEV 포함) — 업무요건 11,12,13,16번 대응 */
export const Q_COMPLY_GET_CVE_FINDINGS = /* GraphQL */ `
  query GetEndpointCveFindings($first: Int!) {
    endpoints(first: $first) {
      edges {
        node {
          name
          ipAddress
          compliance {
            cveFindings {
              absoluteFirstFoundDate
              affectedProducts
              cisaDateAdded
              cisaDueDate
              cisaShortDescription
              cveId
              cveYear
              cvssScoreV3
              detectedProducts
              detectedCPEs
              excepted
              firstFound
              isCisaKev
              lastFound
              scanType
              severityV3
              summary
            }
          }
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasPreviousPage
        hasNextPage
      }
    }
  }
`;

/**
 * 특정 조건(예: cveYear, 심각도 등)으로 필터링된 CVE findings 조회.
 * filter 구조는 실제 FieldFilter를 사용 (path/op/value/any/filters).
 * 업무요건 12,15번(Critical 취약점, 최근 N일 신규 CVE) 대응
 */
export const Q_COMPLY_GET_FILTERED_CVE_FINDINGS = /* GraphQL */ `
  query GetFilteredCveFindings($first: Int!, $filter: FieldFilter) {
    endpoints(first: $first) {
      edges {
        node {
          name
          ipAddress
          compliance {
            cveFindings(filter: $filter) {
              absoluteFirstFoundDate
              cveId
              cveYear
              cvssScore
              cvssScoreV3
              detectedProducts
              detectedCPEs
              firstFound
              lastFound
              severity
              severityV3
              isCisaKev
              summary
            }
          }
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasPreviousPage
        hasNextPage
      }
    }
  }
`;

// =====================================================================================
// 3. Deploy
// =====================================================================================

/** Deploy 패키지 카탈로그 조회 — 업무요건 17번(패치 배포) 대응 */
export const Q_DEPLOY_GET_PACKAGES = /* GraphQL */ `
  query GetDeployPackages {
    softwarePackages {
      edges {
        node {
          id
          productName
          productVendor
          productVersion
          platform
          applicabilityCounts {
            installEligibleCount
            installedCount
            notApplicableCount
            updateEligibleCount
            updateIneligibleCount
          }
        }
      }
    }
  }
`;

/** 소프트웨어 배포 진행 상태 조회 (전체 또는 특정 ID) — 업무요건 17번(패치 배포 성공률) 대응 */
export const Q_DEPLOY_GET_DEPLOYMENT_STATUS = /* GraphQL */ `
  query GetSoftwareDeploymentStatus($id: ID) {
    softwareDeployment(id: $id) {
      ID
      name
      status {
        completeCount
        downloadCompleteWaitingCount
        downloadingCount
        failedCount
        notApplicableCount
        runningCount
        waitingCount
      }
      errors {
        error
        count
      }
    }
  }
`;

/**
 * 패키지를 특정 컴퓨터 그룹에 배포 (mutation).
 * ⚠️ 이 mutation은 실제로 엔드포인트에 소프트웨어를 배포하는 "쓰기" 동작입니다.
 * MCP Tool로 노출할 경우 반드시 사용자 확인 절차를 거친 후 호출하세요.
 */
export const M_DEPLOY_MANAGE_SOFTWARE = /* GraphQL */ `
  mutation DeployPackage($packageId: Int!, $group: String, $start: Time, $end: Time) {
    manageSoftware(
      operation: INSTALL
      softwarePackageID: $packageId
      start: $start
      end: $end
      target: { targetGroup: $group }
    ) {
      ID
      name
    }
  }
`;

// =====================================================================================
// 4. Discover
// =====================================================================================

/** Discover로 발견된 인터페이스(자산) 목록 조회 — 업무요건 8,9번(Tanium 관리 비율/미관리 자산) 대응 */
export const Q_DISCOVER_GET_INTERFACES = /* GraphQL */ `
  query GetDiscoverInterfaces($first: Int, $filter: FieldFilter) {
    discoverInterfaces(first: $first, filter: $filter) {
      edges {
        node {
          id
          hostnames
          ipAddresses
          macAddress
          manufacturer
          osPlatform
          osGeneration
          computerId
          isManaged
          isUnmanageable
          isIgnored
          discoveryMethods
          firstSeenTime
          firstManagedTime
          lastManagedTime
          lastDiscoveredTime
          labels {
            name
            type
          }
        }
      }
      totalRecords
    }
  }
`;

/**
 * 미관리(Unmanaged) 자산만 조회할 때 사용하는 filter 예시 값.
 * 실제 호출 시 variables.filter 에 아래 객체를 그대로 전달하면 됩니다.
 * 업무요건 9번(미관리 자산 목록) 대응
 */
export const FILTER_DISCOVER_UNMANAGED = {
  path: "isManaged",
  op: "EQ",
  value: "false",
};

/** Discover 레이블(자동/수동 태그)별 관리·미관리 자산 집계 — 업무요건 8번(전산화 수준) 대응 */
export const Q_DISCOVER_GET_LABELS = /* GraphQL */ `
  query GetDiscoverLabels($first: Int) {
    discoverLabels(first: $first) {
      edges {
        node {
          name
          type
          createdTime
          modifiedTime
          interfaceCounts {
            managed
            unmanaged
            total
            unmanageable
          }
        }
      }
    }
  }
`;

// =====================================================================================
// 5. Integrity Monitor
// =====================================================================================

/** Integrity Monitor 서비스(모니터/워치리스트) 배포 상태 조회 */
export const Q_IM_GET_STATUS = /* GraphQL */ `
  query GetIMServiceStatus {
    integrityMonitorStatus {
      isDeployingMonitors
      isDeployingWatchlists
    }
  }
`;

/** Integrity Monitor 모니터 목록 조회 (우선순위 순 정렬) */
export const Q_IM_GET_MONITORS = /* GraphQL */ `
  query GetIMMonitors($first: Int) {
    integrityMonitorMonitors(first: $first) {
      edges {
        node {
          id
          name
          priority
          revision
          deploymentStatus
          collectProcessInformation
          computerGroups {
            edges {
              node {
                id
                name
                expression
              }
            }
          }
        }
      }
      totalRecords
    }
  }
`;

/** Integrity Monitor 워치리스트 목록 조회 (모니터링 대상 파일/레지스트리 경로) */
export const Q_IM_GET_WATCHLISTS = /* GraphQL */ `
  query GetIMWatchlists($first: Int) {
    integrityMonitorWatchlists(first: $first) {
      edges {
        node {
          id
          name
          description
          pathStyle
          deploymentStatus
          revision
          computerGroups {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    }
  }
`;

// =====================================================================================
// 6. Patch
// =====================================================================================

/** CVE ID로 Patch 정의(패치 카탈로그) 검색 — 업무요건 6,21번(EOL/패치 대응) 대응 */
export const Q_PATCH_GET_DEFINITIONS = /* GraphQL */ `
  query GetPatchDefinitions($first: Int, $filter: PatchDefinitionFieldFilter, $sort: PatchDefinitionFieldSort) {
    patchDefinitions(first: $first, filter: $filter, sort: $sort) {
      edges {
        node {
          id
          createdDate
          cveIds
          isSuperseded
          platform
          releaseDate
          severity
          sizeInBytes
          title
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalRecords
    }
  }
`;

/** 특정 Patch 배포(deployment) 상세 조회 (스케줄/대상/상태 포함) — 업무요건 17,18번 대응 */
export const Q_PATCH_GET_DEPLOYMENT = /* GraphQL */ `
  query GetPatchDeployment($id: ID!) {
    patchDeployment(ref: { id: $id }) {
      id
      name
      description
      platform
      status
      restart
      contentDeploymentType
      createdTime
      updatedTime
      stoppedTime
      schedule {
        startTime
        endTime
        type
        timeZone
      }
      targets {
        computerGroups {
          id
        }
      }
    }
  }
`;

/** 특정 컴퓨터 그룹에 적용 가능한 패치 목록 조회 (센서 기반) — 업무요건 17번(패치 적용 대상) 대응 */
export const Q_PATCH_GET_APPLICABILITY = /* GraphQL */ `
  query GetPatchApplicability($cg: String!) {
    endpoints(filter: { path: "memberOf.name", op: EQ, value: $cg }) {
      totalRecords
      edges {
        node {
          computerID
          name
          sensorReadings(sensors: [{ name: "Patch - Patch List Applicability" }]) {
            columns {
              name
              values
            }
          }
        }
      }
    }
  }
`;

// =====================================================================================
// 7. Reporting
// =====================================================================================

/** 저장된 Report 목록 조회 (모듈/작성자/라벨 필터 가능) */
export const Q_REPORTING_GET_REPORTS = /* GraphQL */ `
  query GetReports($first: Int, $filter: ReportFieldFilter) {
    reports(first: $first, filter: $filter) {
      edges {
        node {
          id
          name
          description
          moduleName
          labels
          createdTime
          modifiedTime
          favorite
        }
      }
    }
  }
`;

/** 특정 Report의 실제 결과 데이터 조회 (컬럼 값 + 뷰 정의) */
export const Q_REPORTING_GET_REPORT_RESULT_DATA = /* GraphQL */ `
  query GetReportResultData($id: ID!, $first: Int, $summarize: Boolean!) {
    reportResultData(id: $id, first: $first, summarize: $summarize) {
      edges {
        node {
          columns {
            values
          }
          count
        }
      }
      viewDetails {
        columns {
          name
        }
      }
      totalRecords
    }
  }
`;

// =====================================================================================
// 8. Threat Response
// =====================================================================================

/**
 * Threat Response는 Direct Connect를 통해 "연결을 먼저 연 뒤" 데이터를 조회하는 2단계 흐름입니다.
 * ① directConnectOpen 으로 connectionID 획득 → ② directConnectEndpoint 로 alerts 조회.
 */

/** 1단계: 엔드포인트에 Direct Connect 연결 열기 */
export const M_TR_OPEN_CONNECTION = /* GraphQL */ `
  mutation OpenEndpointConnection($id: ID!) {
    directConnectOpen(input: { endpointID: $id }) {
      connectionID
      status
    }
  }
`;

/** 2단계: 열린 연결을 통해 최근 24시간 알림(alerts) 조회 — 업무요건 25번(제로데이/이상탐지) 대응 */
export const Q_TR_GET_ENDPOINT_ALERTS = /* GraphQL */ `
  query GetEndpointAlerts($id: ID!) {
    directConnectEndpoint(input: { connectionID: $id }) {
      alerts {
        all {
          schema
          key
          type
          labels
          pendingAt
          start
          resolvedAt
          value
        }
      }
    }
  }
`;

/** 특정 Threat Response 알림(Alert)을 "해결됨(Resolved)" 상태로 변경 (mutation) */
export const M_TR_RESOLVE_ALERT = /* GraphQL */ `
  mutation ResolveTHRAlert($guid: ID) {
    threatResponseAlertResolve(ref: { guid: $guid }) {
      resolved
      guid
      error {
        message
      }
    }
  }
`;


export const Q_CRITICAL_CVE_ASSETS = `
  query CriticalCveAssets($perPage: Int, $page: Int) {
    assets(
      perPage: $perPage
      page: $page
      filter: {
        field: ENDPOINT_COMPLIANCE_CVE_FINDINGS_SEVERITY
        op: EQ
        value: "Critical"
      }
    ) {
      items {
        id
        cveFindings {
          cveId
          severity
          cvssScore
          isCisaKev
          firstFound
        }
      }
      pageInfo { hasNextPage }
    }
  }
`;
