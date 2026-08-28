---
name: tanium-mcp-reporting
description: >
  Tanium Reporting에 저장된 보고서 목록 조회, 보고서 결과 데이터 추출, 패치/취약점/
  소프트웨어·하드웨어 인벤토리 관련 보고서 조회에 사용합니다. "보고서", "리포트",
  "Report", "대시보드 데이터 추출" 등의 키워드가 포함된 질문에 트리거하세요.
  (근거: Tanium-Task-Area.xlsx의 "Report" 영역 중 Tool로 지원 가능한 항목)
---

# 보고서 조회 Skill

## 지원 업무 항목

| 원 업무요건 | 예시 질의 | 사용 Tool | 지원 수준 |
|---|---|---|---|
| Custom Reports | "저장된 보고서 목록을 보여줘" | `get_reports` | 지원 |
| Query-Based Reports | "이 보고서의 실제 데이터를 뽑아줘" | `get_report_result_data` | 지원 |
| Patch Reports | 패치 배포 성공/실패 현황 리포트 | `get_deployment_status`, `get_patch_deployment` (또는 관련 저장 보고서를 `get_reports`로 조회) | 지원 |
| Vulnerability Reports | 취약점/CVE 현황 리포트 | `get_cve_findings`, `get_compliance_findings` | 지원 |
| Software and Hardware Inventory Reports | SW/HW 인벤토리 요약 | `get_installed_applications`, `get_all_assets` | 지원 |
| Audit-Specific Reports | PCI/ISO/SOC2 등 표준 준수 현황 | `get_compliance_findings` (`standard` 필드가 매핑되어 있는 경우) | **부분지원** |
| Security Event Reports | 보안 이벤트/이상탐지 리포트 | `get_endpoint_threat_alerts` | **부분지원** (엔드포인트 단위 조회만 가능) |
| Report Export Options | 결과를 표/CSV 등으로 내보내기 | (Claude가 응답 시 표 또는 파일로 변환) | 지원 |

## 표준 응답 절차
1. "어떤 보고서가 있는지" 질의는 `get_reports`(필요 시 `text`/`moduleName` 필터)로 목록을 먼저 보여준다.
2. 특정 보고서의 실제 수치가 필요하면 보고서 ID를 확인한 뒤 `get_report_result_data`를 호출한다.
3. Reporting에 해당 주제의 저장된 보고서가 없다면, 같은 데이터를 다루는 다른 Skill(Asset/Comply/Patch/Deploy)의 Tool로 직접 조회해 대체 제공한다.
4. 결과를 CSV/표 형태로 요청받으면 Claude가 응답 또는 파일 생성 기능으로 변환해 제공한다.

## 이 Skill이 다루지 않는 것 (현재 Tool 미지원)
- BI 도구(Power BI, Tableau) 연동, 예약(Scheduled) 자동 리포트 발송
- 기기 사용 이력/보증기간/AD 상세속성/라이선스 계약 현황 리포트
- 역할 기반 리포트 접근 제어

## 주의사항
- Reporting 결과는 저장된 보고서 정의(Report View)에 의존하므로, 원하는 데이터를 다루는 보고서가 없을 수 있다. 이 경우 반드시 다른 모듈의 Tool로 직접 조회하는 대안을 제시한다.