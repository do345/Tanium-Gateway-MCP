---
name: tanium-asset-classification
description: >-
  Classifies Tanium-registered endpoints by chassisType/isVirtual and reports
  Discover managed/unmanaged coverage. Use when the user asks for an asset
  classification report, 자산 분류, 자산 현황, chassisType, isVirtual, Tanium 관리 비율,
  Discover labels, or the asset_classification_report prompt.
---

# Tanium 자산 분류 리포트

Tanium Gateway MCP로 등록 자산을 폼팩터 분류하고, Discover 관리 비율을 함께 요약한다.

## 조회

병렬 호출:

1. `get_all_assets` — `first`를 크게 (예: 500). `hasNextPage`가 true면 더 조회.
2. `get_discover_labels` — `first` 100.
3. `get_discover_interfaces` — `first`를 `totalRecords` 이상이 되도록. 레이블은 중복 부여되므로 **전체 관리 비율의 분모로 쓰지 말 것.**

## 폼팩터 분류

등록 자산만 분류한다. Discover 인터페이스는 관리 비율용.

| 분류 | 조건 |
|---|---|
| 가상머신 | `isVirtual=true` 이고 `chassisType`가 Virtual이거나 비어 있음 |
| 물리 노트북 | `isVirtual=false` 이고 `chassisType`가 Notebook / Laptop / Portable |
| 물리 데스크탑 | `isVirtual=false` 이고 `chassisType`가 Desktop / Mini Tower / Tower / Low Profile Desktop |
| 물리 서버 | `isVirtual=false` 이고 `chassisType`가 Rack Mount Chassis / Blade / Main Server Chassis |
| 분류 애매 | 아래 애매 규칙 |

같은 자산이 두 칸에 들어가지 않게 한다. 충돌하면 애매로 보낸다.

### 애매로 보내는 경우

- `Convertible`, `Tablet`, `Handheld`, `Other`, `Unknown`, 빈 `chassisType`
- `isVirtual=true` 인데 `chassisType`가 Notebook/Desktop/Server 계열
- `isVirtual=false` 인데 `chassisType=Virtual`
- 필드 누락

Convertible은 2-in-1이라 물리인 것은 확실해도 Notebook으로 넣지 않는다.

## 관리 비율

`get_discover_interfaces`에서 인터페이스 단위로 집계:

- **Managed**: `isManaged=true`
- **Unmanageable**: `isUnmanageable=true` (Managed가 아님)
- **Unmanaged**: 나머지 (`isManaged=false` 이고 `isUnmanageable=false`)

보고할 숫자:

- 전체 관리 비율 = Managed / 전체 인터페이스
- 관리 가능 대비 관리율 = Managed / (Managed + Unmanaged)  — Unmanageable 제외
- Managed 고유 `computerId` 수. 한 호스트가 NIC 여러 개면 인터페이스 수가 자산 수보다 클 수 있다.

`get_discover_labels`는 레이블별 표만. `interfaceCounts`를 레이블 간에 더하지 않는다. `total=0`인 자동 레이블(Lost Interface, New Managed/Unmanaged Interface 등)은 생략.

레이블 관리 비율 = 그 레이블의 `managed / total`.

## 출력

분석 결과는 Cursor Canvas로 만든다. 채팅에는 핵심 숫자와 애매 자산만 짧게.

필수 섹션:

1. 요약 지표 — 등록 자산 수, 가상/물리/애매, Discover 관리 비율
2. 분류 기준 한 줄
3. 분류 요약 표 (분류 / 판정 규칙 / 대수 / 비율)
4. 등록 자산 목록 (호스트, IP, 분류, chassisType, isVirtual, OS, 도메인)
5. 애매 자산 표 (이유 컬럼 포함). 없으면 섹션 생략
6. Discover 관리 상태 (Managed / Unmanaged / Unmanageable)
7. 레이블별 관리/미관리 표

차트 캡션에 소스 툴명과 조회 시각을 적는다. 레이블 건수는 합산하지 말라는 주의를 표 근처에 둔다.

한국어로 보고한다.
