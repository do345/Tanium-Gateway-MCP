---
name: tanium-mcp-it-asset-inventory
description: >
  전체 IT자산(엔드포인트) 목록/개수, 인프라 영역별 분류(서버/가상화 등), 제조사/모델명/OS버전/IP 등
  관리항목, 설치 소프트웨어·OS·패치·가상머신 인벤토리 조회에 사용합니다.
  "IT자산 목록", "자산 현황", "자산 분류", "제조사", "OS 버전", "인벤토리" 등의 키워드가 포함된
  질문에 트리거하세요.
  (근거: Tanium-Task-Area.xlsx의 "IT자산 식별·관리", "Inventory" 영역 중 Tool로 지원 가능한 항목)
---

# IT자산 식별·관리 / 인벤토리 Skill

## 지원 업무 항목

| 원 업무요건 | 예시 질의 | 사용 Tool | 지원 수준 |
|---|---|---|---|
| 전체 IT자산 현황·목록 | "우리 회사 전체 IT자산 목록을 보여줘" | `get_all_assets` | 지원 |
| 자산 분류(인프라 영역) | "서버, DB, 네트워크 장비, OS 가상화 시스템별로 자산 개수를 분류해서 보여줘" | `get_all_assets` (`chassisType`, `isVirtual` 필드로 근사 분류) | **부분지원** |
| 관리항목(제조사/모델명/OS버전/IP) | "각 자산의 제조사, 모델명, OS 버전, IP 주소를 정리해서 보여줘" | `get_all_assets`, `get_asset_product_endpoints` | **부분지원** (EOL 예정일은 미지원) |
| Software Inventory | 설치된 전체 소프트웨어 목록 | `get_installed_applications` | 지원 |
| Hardware Inventory | 하드웨어 상세 정보 | `get_all_assets` (`processor` 필드만) | **부분지원** (RAM/디스크/마더보드 등은 미포함) |
| Operating System Inventory | OS 버전/에디션/빌드 | `get_all_assets`, `get_asset_product_endpoints` | 지원 |
| Virtual Machine Inventory | 가상머신 여부 확인 | `get_all_assets` (`isVirtual`) | 지원 |
| Patch Inventory | 설치된 패치 이력 | `get_patch_definitions`, `get_patch_deployment` | 지원 |
| Application Version Tracking | 설치 애플리케이션 버전 추적 | `get_installed_applications`, `get_asset_product_endpoints` | 지원 |
| Inventory Export & API Access | 인벤토리 데이터 내보내기/API 접근 | (Claude 응답 시 표/CSV로 변환) | 지원 |

## 표준 응답 절차
1. "전체 자산" 질의는 `get_all_assets`를 우선 호출하고, 자산 수가 많으면 개수 요약 → 대표 항목 20~30건 표시 → 전체 필요 시 안내 순서로 응답한다.
2. "분류" 질의는 `chassisType`/`isVirtual` 값을 기준으로 Claude가 응답 시점에 그룹핑한다. 정확한 서버/DB 구분 필드가 없다는 점을 답변에 함께 안내한다.
3. 제조사/모델명/버전 등 특정 소프트웨어 자산이 궁금하면 `get_asset_product_endpoints`로 벤더/제품명 기준 조회한다.
4. OS/애플리케이션 버전 질의는 `get_installed_applications` 또는 `get_asset_product_endpoints`의 버전 필드를 사용한다.

## 이 Skill이 다루지 않는 것 (현재 Tool 미지원)
- 최근 30일 신규 자산 / 6개월 이상 비활성 자산 (마지막 통신일자 필드 없음)
- EOL(기술지원 종료) 예정일
- 자산 중요도(상/중/하) 등급
- 인증서/드라이버/라이선스/배터리/BIOS/주변기기 인벤토리
이런 질문을 받으면 "현재 연동된 Tool로는 조회할 수 없다"고 명확히 안내하고, 임의로 추정하지 않는다.