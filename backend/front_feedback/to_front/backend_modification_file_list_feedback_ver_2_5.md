# MirrAI 백엔드 수정 대상 파일 리스트 (2026-03-25)

본 문서는 `backend_implementation_guide_2026-03-25.md` 가이드에 명시된 프론트엔드 요청 사항 및 API 규약을 준수하기 위해 수정이 필요한 백엔드 파일 리스트를 정리한 것입니다.

> [백엔드 주석]
> 아래 체크박스는 **현재 프론트 구현 상태까지 포함해 볼 때, 이 항목이 실제 연동 준비 측면에서 충족됐는지**를 표시합니다.
> - `[x]` = 현재 backend 구현과 front 구현 상태를 함께 봐도, 이 항목은 큰 blocker 없이 진행 가능
> - `[ ]` = backend가 일부 미흡하거나, front가 아직 이 항목을 실제로 소비할 준비가 부족해 “충족”이라고 보기 어려움

---

## 1. API 인터페이스 및 규약 (Serializers & Views)
프론트엔드와 약속한 `camelCase` 필드 및 공통 에러 응답을 적용하기 위해 수정해야 할 핵심 파일입니다.

| 충족 | 파일 경로 | 주요 수정 내용 | 백엔드 검토 메모 |
| :---: | :--- | :--- | :--- |
| `[x]` | `backend/app/api/v1/django_serializers.py` | `ClientRegisterSerializer`, `RecommendationListResponseSerializer` 등에 `camelCase` alias 필드 추가. `match`, `reasoning`, `tags` 등 추천 결과 필드 추가. | `match`, `reasoning`, `tags`, camelCase alias는 반영돼 있습니다. 프론트 고객 화면은 아직 mock 기반이지만, 계약 자체는 현재 backend 기준으로 충족 상태입니다. |
| `[x]` | `backend/app/api/v1/admin_serializers.py` | 관리자 대시보드 데이터 포맷 수정 (`todaySummary`, `chartData` 등 프론트엔드 차트 매핑 구조 최적화). | `todaySummary`, `chartData`는 이미 backend 응답에 포함됩니다. 관리자 화면도 해당 구조를 수용 가능한 UI를 갖고 있어 이 항목은 충족으로 봅니다. |
| `[ ]` | `backend/app/api/v1/django_views.py` | 모든 API 응답에서 공통 에러 봉투(`envelope`) 구조 적용 및 Enum 값(Next Action 등) 반환 로직 점검. | `nextAction` 계열 enum/alias는 반영됐습니다. 다만 공통 error envelope는 아직 없고, 프론트도 실제 API 호출이 없어서 에러 소비 방식이 미정입니다. 이 항목은 미충족으로 보는 게 안전합니다. |
| `[ ]` | `backend/app/api/v1/admin_views.py` | 관리자 전용 API의 응답 구조 통일 및 예외 처리 강화. | 관리자 응답 shape는 대부분 맞췄지만, 예외 응답은 DRF 기본 형식입니다. 또한 관리자 프론트는 아직 mockData 직접 사용이라 실제 에러 처리까지는 검증되지 않았습니다. |

---

## 2. 비즈니스 로직 및 서비스 (Services)
비즈니스 로직 및 상태값(Enum)을 프론트엔드 규약과 일치시키기 위한 수정입니다.

| 충족 | 파일 경로 | 주요 수정 내용 | 백엔드 검토 메모 |
| :---: | :--- | :--- | :--- |
| `[x]` | `backend/app/api/v1/services_django.py` | `get_current_recommendations`, `run_mirrai_analysis_pipeline` 등에서 `next_action`, `recommendation_mode` 등의 상태값을 규약과 일치시킴. 추천 엔진 결과에 `match`, `reasoning` 데이터 포함. | 반영돼 있습니다. `nextAction`, `recommendationMode`, `nextActions`, `captureRequiredForFullResult`, `imagePolicy`, `canRegenerateSimulation`까지 보강했습니다. 프론트 고객 화면은 아직 API를 안 붙였지만, backend 요구사항은 충족입니다. |
| `[x]` | `backend/app/api/v1/admin_services.py` | 대시보드 및 트렌드 분석 API의 반환 데이터 가공 로직 수정. | 반영돼 있습니다. `todaySummary`, `summaryCards`, `topStylesToday`, `chartData`, `customer`, `todayStyle`, `recommendedStyles`, `items`, `hairstyles` 등을 제공합니다. 관리자 프론트 UI도 대응 가능한 구조입니다. |
| `[x]` | `backend/app/api/v1/recommendation_logic.py` | AI 추천 엔진에서 생성하는 원시 데이터를 프론트엔드 규약 포맷으로 정제. | `match`, `reasoning`, `reasoning_snapshot`, `match_score` 관련 요구는 현재 backend 기준 충족입니다. |

> [백엔드 주석]
> 현재 서비스 계층에서 front와 실제 충돌 가능성이 큰 부분은 “추천 품질”보다 **이미지 정책 해석**입니다.
> 최신 backend 정책은 아래 3단계입니다.
> - `asset_store`
> - `restricted_internal_store`
> - `vector_only`

---

## 3. 인증 및 보안 (Authentication)
`Bearer` 토큰 체계 및 토큰 갱신 로직 강화를 위한 수정입니다.

| 충족 | 파일 경로 | 주요 수정 내용 | 백엔드 검토 메모 |
| :---: | :--- | :--- | :--- |
| `[ ]` | `backend/app/api/v1/admin_auth.py` | `AdminTokenAuthentication` 클래스의 `Bearer` 접두사 처리 로직 및 토큰 유효성 검증 로직 점검. | `Bearer` 접두사 처리와 토큰 검증은 동작합니다. 하지만 문서 문구에 포함된 refresh/token 갱신 로직은 현재 없습니다. 프론트도 세션 저장/재로그인 전략이 아직 없어서 이 항목은 미충족으로 둡니다. |

> [백엔드 주석]
> 현재 기준 인증 방식은 `Authorization: Bearer {access_token}` 입니다.
> refresh token을 전제로 구현하면 실제 backend와 충돌합니다.

---

## 4. 데이터 모델 (Models & Migrations)
추가적인 데이터 저장 요구사항이 있을 경우 수정이 필요합니다.

| 충족 | 파일 경로 | 주요 수정 내용 | 백엔드 검토 메모 |
| :---: | :--- | :--- | :--- |
| `[x]` | `backend/app/models_django.py` | 추천 결과 히스토리(`FormerRecommendation`)에 `reasoning_snapshot`, `match_score` 등 필드 추가 여부 검토 및 마이그레이션. | 이미 반영돼 있습니다. 관련 테스트도 존재합니다. 프론트가 아직 추천 이력 API를 직접 소비하진 않지만, backend 요구사항 자체는 충족입니다. |

---

## 우선순위 권장사항
1.  **Serializer (인터페이스):** 프론트엔드 개발 가시성을 위해 필드명(camelCase) 및 필드 추가를 최우선 진행.
2.  **Enum (상태값):** 화면 분기 처리에 핵심적인 `next_action` 값 통일.
3.  **Service (로직):** 추천 품질 향상을 위한 `match`, `reasoning` 생성 로직 고도화.

> [백엔드 주석]
> 현재 시점에서는 새 backend 기능 추가보다 아래가 더 중요합니다.
> 1. 프론트가 mockData 대신 실제 API를 붙이기 시작할지
> 2. `restricted_internal_store`를 프론트 UX에서 어떻게 처리할지
> 3. 공통 error envelope 없이 DRF 기본 에러 형식으로 우선 연결 가능한지
> 4. refresh token 없이 access token 기준으로 먼저 갈지
> 5. `next_action`을 실제 route에 어떻게 매핑할지

> [백엔드 주석]
> 이번 프론트 코드 실사 기준으로는, 관리자 화면은 UI가 준비돼 있지만 대부분 `mockData.ts`를 직접 사용하고 있고,
> 고객 화면은 라우트와 화면 골격은 있으나 실제 `fetch/axios`, 카메라, 세션 저장, 로그아웃 구현이 없습니다.
> 즉 현재 체크는 “backend가 front를 막고 있는가” 관점에서 보면 대체로 충족이지만,
> “front가 실제 API로 바로 대체 가능한가”까지는 일부 항목이 아직 아닙니다.

---
**작성자:** Gemini CLI (Senior Backend Engineer)
