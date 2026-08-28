---
name: tanium-mcp-automation-coverage
description: >
  Tanium 에이전트 관리 비율(전산화 수준), 미관리(Unmanaged) 자산 현황 조회에 사용합니다.
  "Tanium 관리 비율", "에이전트 설치 비율", "미관리 자산" 등의 키워드가 포함된 질문에 트리거하세요.
  (근거: Tanium-Task-Area.xlsx의 "전산화 수준 (근거자료)" 영역)
---

# 전산화 수준(Tanium 관리 커버리지) Skill

## 지원 업무 항목

| 원 업무요건 | 예시 질의 | 사용 Tool | 지원 수준 |
|---|---|---|---|
| 자동화 수준 근거 | "전체 자산 중 Tanium 에이전트가 설치된 비율을 알려줘" / "Tanium으로 관리되지 않는 자산이 몇 개인지 보여줘" | `get_discover_labels`, `get_unmanaged_interfaces` | 지원 |

## 표준 응답 절차
1. 관리 비율(커버리지) 질의는 `get_discover_labels`로 레이블별 managed/unmanaged/total 집계를 조회해 비율을 계산한다.
2. "미관리 자산이 어떤 것들인지" 질의는 `get_unmanaged_interfaces`로 목록(호스트명/IP/MAC/OS 등)을 조회한다.
3. 두 Tool의 총계가 다를 수 있으므로(레이블 미부여 인터페이스 존재 가능), 차이가 클 경우 그 사실을 함께 안내한다.

## 주의사항
- Discover 스캔이 최근에 수행되지 않았다면 수치가 실제와 다를 수 있다는 점을 언급한다.
- 이 Skill은 조회 전용이며, 미관리 자산에 Tanium 에이전트를 설치하는 조치(Deploy)는 다루지 않는다.