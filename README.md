# Tanium Gateway MCP

Tanium Gateway GraphQL API를 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 서버로 노출하는 Node.js 프로젝트입니다. Claude Desktop, Cursor, VS Code, Gemini CLI 등 MCP Host에서 자연어로 Tanium 자산·취약점·패치·배포 정보를 조회할 수 있습니다.

## 기능 개요

| MCP 기능 | 내용 |
|---|---|
| **Tools** | 8개 모듈, 약 20개 Tool (Asset, Comply, Deploy, Discover, Integrity Monitor, Patch, Reporting, Threat Response) |
| **Resources** | FieldFilter 문법, Tool 카탈로그, 알려진 제한사항 (정적 문서) |
| **Prompts** | 주간 취약점 리포트, 패치 준수 스냅샷, 자산 분류 리포트 |

서버는 **stdio** 전송을 사용합니다. LLM은 MCP를 통해 Tool을 호출하고, 서버가 Tanium Gateway GraphQL을 대신 요청합니다.

```
MCP Host (Claude / Cursor / Gemini …)
        │  MCP (stdio)
        ▼
tanium-gateway-mcp
        │  GraphQL (session 헤더)
        ▼
Tanium Gateway (`/plugin/products/gateway/graphql`)
```

## 요구 사항

- Node.js 18 이상 (ES2022 / ESM)
- Tanium 환경의 Gateway GraphQL 엔드포인트
- API 토큰 (`session` 헤더로 전달)

## 설치

```bash
git clone <이 저장소 URL>
cd tanium-gateway-mcp_dev   # 또는 클론한 디렉터리 이름
npm install
```

## 환경 변수

프로젝트 루트에 `.env` 파일을 만듭니다. **토큰은 커밋하지 마세요.** `.gitignore`에 `.env`가 포함되어 있습니다.

```env
TANIUM_BASE_URL=https://your-tanium-instance.example.com
TANIUM_GRAPHQL_PATH=/plugin/products/gateway/graphql
TANIUM_API_TOKEN=your-api-token
```

| 변수 | 필수 | 설명 |
|---|---|---|
| `TANIUM_BASE_URL` | 예 | Tanium 인스턴스 베이스 URL |
| `TANIUM_API_TOKEN` | 예 | Gateway API 토큰 |
| `TANIUM_GRAPHQL_PATH` | 아니오 | 기본값 `/plugin/products/gateway/graphql` |
| `NODE_TLS_REJECT_UNAUTHORIZED` | 아니오 | `0`이면 TLS 검증 비활성. **개발/테스트 전용** |

사내 버전에 따라 인증 헤더명이 `session`이 아닐 수 있습니다. 401이 나면 `src/tanium-client.ts`를 확인하세요.

## 빌드 및 실행

```bash
npm run build          # TypeScript → dist/
node dist/index.js     # stdio MCP 서버 (Host가 spawn하는 방식과 동일)
```

개발 시 TypeScript를 바로 실행하려면:

```bash
npm run dev
```

Tool 목록을 GUI로 확인하려면:

```bash
npm run inspect
```

(`@modelcontextprotocol/inspector` 사용)

## MCP Host 설정 예시 (Cursor)

`~/.cursor/mcp.json` 또는 프로젝트 `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "tanium-gateway": {
      "command": "node",
      "args": ["/절대경로/tanium-gateway-mcp_dev/dist/index.js"],
      "env": {
        "TANIUM_BASE_URL": "https://your-tanium-instance.example.com",
        "TANIUM_GRAPHQL_PATH": "/plugin/products/gateway/graphql",
        "TANIUM_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

설정 후 `npm run build`를 한 번 실행하고, Cursor에서 MCP 서버를 다시 로드하세요.

Gemini CLI, VS Code Copilot 등 다른 Host 연동은 [docs/Gemini_MCP_Host_연동_가이드.md](docs/Gemini_MCP_Host_연동_가이드.md)를 참고하세요.

## Tool 목록

### Asset

| Tool | 설명 |
|---|---|
| `get_all_assets` | 전체 자산 (OS, 프로세서, 가상화 여부 등) |
| `get_asset_product_endpoints` | 벤더/제품/버전 기준 설치 자산 |
| `get_installed_applications` | 설치·실행 중 애플리케이션 센서 |

### Comply

| Tool | 설명 |
|---|---|
| `get_compliance_findings` | 정책/표준 위반 findings |
| `get_cve_findings` | CVE findings 전체 |
| `get_filtered_cve_findings` | 심각도, CISA KEV, 날짜 등 필터 |

### Deploy

| Tool | 설명 |
|---|---|
| `get_deploy_packages` | 패키지 카탈로그 |
| `get_deployment_status` | 배포 진행 상태 |
| `deploy_package_to_group` | 그룹에 패키지 배포 (쓰기, 환경에 따라 제한) |

### Discover

| Tool | 설명 |
|---|---|
| `get_discover_interfaces` | Discover 인터페이스(자산) 목록 |
| `get_unmanaged_interfaces` | 미관리 자산만 |
| `get_discover_labels` | 레이블별 관리/미관리 집계 |

### Integrity Monitor

| Tool | 설명 |
|---|---|
| `get_integrity_monitor_status` | IM 배포 상태 |
| `get_integrity_monitor_monitors` | 모니터(스캔 설정) |
| `get_integrity_monitor_watchlists` | 워치리스트(감시 경로) |

### Patch

| Tool | 설명 |
|---|---|
| `get_patch_definitions` | CVE 기준 패치 카탈로그 |
| `get_patch_deployment` | 특정 배포 상세 |
| `get_patch_applicability` | 컴퓨터 그룹별 적용 가능 패치 |

### Reporting

| Tool | 설명 |
|---|---|
| `get_reports` | 저장된 보고서 목록 |
| `get_report_result_data` | 보고서 결과 데이터 |

### Threat Response

| Tool | 설명 |
|---|---|
| `get_endpoint_threat_alerts` | 엔드포인트 위협 알림 |
| `resolve_threat_alert` | 알림 해결 처리 (쓰기) |

목록형 쿼리는 Tanium Gateway 공통 **FieldFilter** (`path` / `op` / `value` / `any` / `filters`)를 사용합니다. 문법은 MCP Resource `tanium://docs/field-filter-syntax`에도 있습니다.

## Prompts

| Prompt | 용도 |
|---|---|
| `weekly_vuln_report` | 최근 N일 Critical/CISA KEV CVE 요약 |
| `patch_compliance_snapshot` | 컴플라이언스 Pass/Fail 및 위반 그룹핑 |
| `asset_classification_report` | 자산 분류 + Discover 관리 비율 |

## 프로젝트 구조

```
src/
  index.ts                 # MCP 서버 엔트리 (stdio)
  tanium-client.ts         # GraphQL 클라이언트
  resources.ts             # MCP Resources
  prompts.ts               # MCP Prompts
  tools/                   # 모듈별 Tool
    asset.ts
    comply.ts
    deploy.ts
    discover.ts
    integrityMonitor.ts
    patch.ts
    reporting.ts
    threatResponse.ts
docs/
  Tanium_Gateway_MCP_구축_가이드.md
```

## GitHub에 올리기 전에

1. **`.env`를 커밋하지 마세요.** (이미 `.gitignore`에 있음)
2. **`mcp.json`, `.cursor/mcp.json`에 실제 토큰이 들어 있으면 저장소에 넣지 마세요.** 예시는 플레이스홀더만 사용하세요.
3. `dist/`와 `node_modules/`는 커밋하지 않습니다. 클론 후 `npm install` 및 `npm run build`로 생성합니다.

## 알려진 제한

다음 영역은 현재 Tool로 조회하지 않습니다. 상세는 Resource `tanium://docs/known-limitations`를 참고하세요.

- 자산 생애주기·EOL 예정일, 커스텀 중요도 등급
- 패치 SLA, 승인 워크플로, 자동 롤백
- Self Service Portal, MDM, Disk Encryption 등 별도 모듈 전역

## 라이선스

이 저장소에 라이선스 파일이 없으면, 업로드 시 사용 조건을 명시하는 것을 권장합니다.
