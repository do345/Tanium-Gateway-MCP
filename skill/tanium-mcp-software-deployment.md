---
name: tanium-mcp-software-deployment
description: >
  Deploy 솔루션의 사전 제작 소프트웨어 패키지 카탈로그 조회(및 배포)에 사용합니다.
  "소프트웨어 배포", "패키지 카탈로그", "Chrome/Zoom/Adobe 배포" 등의 키워드가 포함된
  질문에 트리거하세요.
  (근거: Tanium-Task-Area.xlsx의 "Software Management" 영역 중 "S/W Deployment (Prebuilt Packages)")
---

# 소프트웨어 배포 관리 Skill

## 지원 업무 항목

| 원 업무요건 | 예시 질의 | 사용 Tool | 지원 수준 |
|---|---|---|---|
| S/W Deployment (Prebuilt Packages) | "Deploy에 등록된 소프트웨어 패키지 카탈로그를 보여줘" / "Chrome을 재무팀 그룹에 배포해줘" | `get_deploy_packages` (조회), `deploy_package_to_group` (배포, 기본 비활성) | **부분지원** |

## 표준 응답 절차
1. "어떤 패키지를 배포할 수 있는지" 질의는 `get_deploy_packages`로 카탈로그(제품명/벤더/버전/적용 가능 대수)를 조회한다.
2. 실제 배포 요청("~를 배포해줘")을 받으면, 먼저 대상 패키지 ID·대상 컴퓨터 그룹·배포 일정을 사용자에게 재확인한 뒤 `deploy_package_to_group`을 호출한다. 이 Tool은 기본적으로 비활성화되어 있으므로, 서버 운영자가 명시적으로 활성화했는지 먼저 확인이 필요할 수 있다.
3. 배포 후에는 `get_deployment_status`(패치·취약점 관리 Skill 소속)로 진행 상태를 안내할 수 있음을 언급한다.

## 이 Skill이 다루지 않는 것 (현재 Tool 미지원)
- 커스텀 패키지 생성(탐지 규칙 지정), 사내 개발 SW 패키징, 스크립트/ZIP/폴더 기반 배포
- 소프트웨어 제거(Uninstall), UAC 권한 처리, 패키지 용량 제한 조회

## 주의사항
- `deploy_package_to_group`은 실제로 엔드포인트에 영향을 주는 되돌리기 어려운 동작이다. 사용자의 명시적 확인 없이는 절대 호출하지 않는다.