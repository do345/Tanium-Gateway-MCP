---
name: tanium-mcp-oss-management
description: >
  설치된 오픈소스 소프트웨어 목록/버전, OSS 취약점(CVE) 점검, 자산-취약점 연계(VulnOps) 대시보드
  조회에 사용합니다. "오픈소스", "OSS", "설치 SW", "CVE", "취약점", "Critical 취약점",
  "취약점 상위 자산" 등의 키워드가 포함된 질문에 트리거하세요.
  (근거: Tanium-Task-Area.xlsx의 "오픈소스 관리" 영역)
---

# 오픈소스 관리 Skill

## 지원 업무 항목

| 원 업무요건 | 예시 질의 | 사용 Tool | 지원 수준 |
|---|---|---|---|
| OSS 목록/사용 현황 | "전체 엔드포인트에 설치된 오픈소스 소프트웨어 목록과 버전을 보여줘" | `get_installed_applications` | 지원 |
| OSS 취약점 점검 | "설치된 오픈소스 중 CVE가 있는 항목을 심각도별로 보여줘" / "Critical 등급 취약점이 있는 오픈소스를 찾아줘" | `get_cve_findings`, `get_filtered_cve_findings` | 지원 |
| 자산-취약점 연계 운영 | "자산별 CVE를 매핑해서 통합 대시보드로 보여줘" / "가장 많은 취약점을 보유한 상위 10개 자산" | `get_cve_findings` (자산별 매핑은 Tool 응답 그대로, Top N 정렬은 Claude가 응답 시 계산) | 지원 |

## 표준 응답 절차
1. 설치 SW/버전 질의는 `get_installed_applications` 결과에서 이름/버전 컬럼을 정리해 보여준다.
2. 심각도별 취약점 질의는 `get_filtered_cve_findings`에 `{"path":"severityV3","op":"EQ","value":"Critical"}` 형태의 filter를 전달한다.
3. "Top 10 취약점 보유 자산"처럼 정렬/순위가 필요한 질의는 `get_cve_findings`로 전체를 가져온 뒤, 각 자산의 `cveFindings` 배열 길이를 기준으로 Claude가 응답 시 정렬한다(전용 정렬 Tool은 없음).
4. CISA KEV(긴급 대응 필요) 항목이 결과에 있으면 응답 최상단에 강조해서 보여준다.

## 주의사항
- 이 Skill은 조회(Read) 전용이다. 실제 패치/제거 조치는 `patch-vulnerability-management` Skill을 참고한다.
- "오픈소스"와 "일반 상용 SW"는 Tool 상 구분되지 않는다(둘 다 `detectedProducts`/애플리케이션 이름으로만 식별). 필요 시 사용자에게 특정 제품명을 물어보는 것이 정확하다.