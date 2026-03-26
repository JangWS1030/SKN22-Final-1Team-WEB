# MirrAI 백엔드 수정 대상 파일 리스트 (2026-03-25)

본 문서는 `backend_implementation_guide_2026-03-25.md` 가이드에 명시된 프론트엔드 요청 사항 및 API 규약을 준수하기 위해 수정이 필요한 백엔드 파일 리스트를 정리한 것입니다.

> [백엔드 주석]
> 아래 체크박스는 **프론트 기준으로 이 항목에 대해 백엔드에 추가 작업을 더 요청하지 않아도 되는지**를 표시합니다.
> - `[x]` = 현재 backend 기준으로 프론트가 추가 요청 없이 바로 연동을 시작해도 되는 상태
> - `[ ]` = 아직 추가 backend 작업이 필요하거나, 현재 기준으로는 일부 미흡한 상태

---

## 1. API 인터페이스 및 규약 (Serializers & Views)
프론트엔드와 약속한 `camelCase` 필드 및 공통 에러 응답을 적용하기 위해 수정해야 할 핵심 파일입니다.

| 상태 | 파일 경로 | 주요 수정 내용 | 백엔드 검토 메모 |
| :---: | :--- | :--- | :--- |
| `[x]` | `backend/app/api/v1/django_serializers.py` | `ClientRegisterSerializer`, `RecommendationListResponseSerializer` 등에 `camelCase` alias 필드 추가. `match`, `reasoning`, `tags` 등 추천 결과 필드 추가. | 추천 결과용 `match`, `reasoning`, `tags`, camelCase alias는 반영돼 있습니다. 고객 인증 응답은 serializer보다 view/service에서 직접 구성하는 비중이 큽니다. |
| `[x]` | `backend/app/api/v1/admin_serializers.py` | 관리자 대시보드 데이터 포맷 수정 (`todaySummary`, `chartData` 등 프론트엔드 차트 매핑 구조 최적화). | `todaySummary`, `chartData`는 이미 응답에 포함되어 있습니다. 실제 데이터 가공은 이 파일보다 `admin_services.py` 중심이지만, 프론트가 필요로 하는 구조는 현재 backend에서 제공 가능합니다. |
| `[ ]` | `backend/app/api/v1/django_views.py` | 모든 API 응답에서 공통 에러 봉투(`envelope`) 구조 적용 및 Enum 값(Next Action 등) 반환 로직 점검. | `Next Action`/alias는 반영됐지만, 공통 error envelope는 아직 없습니다. 현재는 DRF 기본 validation error / `detail` 기반 auth error를 사용합니다. |
| `[ ]` | `backend/app/api/v1/admin_views.py` | 관리자 전용 API의 응답 구조 통일 및 예외 처리 강화. | 관리자 응답 구조는 서비스 기준으로 많이 정리돼 있습니다. 다만 예외 응답은 여전히 `detail` 기반이라 “공통 envelope” 기준으로는 미완료입니다. |

---

## 2. 비즈니스 로직 및 서비스 (Services)
비즈니스 로직 및 상태값(Enum)을 프론트엔드 규약과 일치시키기 위한 수정입니다.

| 상태 | 파일 경로 | 주요 수정 내용 | 백엔드 검토 메모 |
| :---: | :--- | :--- | :--- |
| `[x]` | `backend/app/api/v1/services_django.py` | `get_current_recommendations`, `run_mirrai_analysis_pipeline` 등에서 `next_action`, `recommendation_mode` 등의 상태값을 규약과 일치시킴. 추천 엔진 결과에 `match`, `reasoning` 데이터 포함. | 반영돼 있습니다. 추가로 `nextAction`, `recommendationMode`, `nextActions`, `captureRequiredForFullResult`, `imagePolicy`, `canRegenerateSimulation`까지 보강돼 있습니다. |
| `[x]` | `backend/app/api/v1/admin_services.py` | 대시보드 및 트렌드 분석 API의 반환 데이터 가공 로직 수정. | 반영돼 있습니다. `todaySummary`, `summaryCards`, `topStylesToday`, `chartData`, `customer`, `todayStyle`, `recommendedStyles`, `items`, `hairstyles` 등을 포함합니다. |
| `[x]` | `backend/app/api/v1/recommendation_logic.py` | AI 추천 엔진에서 생성하는 원시 데이터를 프론트엔드 규약 포맷으로 정제. | `match`, `reasoning`, `reasoning_snapshot`, `match_score` 생성이 이미 들어가 있습니다. |

> [백엔드 주석]
> 현재 섹션에서 프론트가 실제로 추가 요청할 가능성이 큰 건 추천 로직 자체보다 **최신 이미지 정책 해석**입니다.
> 현재 backend는 `vector_only`만 있는 것이 아니라 아래를 함께 사용합니다.
> - `asset_store`
> - `restricted_internal_store`
> - `vector_only`

---

## 3. 인증 및 보안 (Authentication)
`Bearer` 토큰 체계 및 토큰 갱신 로직 강화를 위한 수정입니다.

| 상태 | 파일 경로 | 주요 수정 내용 | 백엔드 검토 메모 |
| :---: | :--- | :--- | :--- |
| `[ ]` | `backend/app/api/v1/admin_auth.py` | `AdminTokenAuthentication` 클래스의 `Bearer` 접두사 처리 로직 및 토큰 유효성 검증 로직 점검. | `Bearer` 접두사 처리와 유효성 검증은 이미 동작 중입니다. 다만 refresh token 흐름은 현재 없습니다. 문서 문구가 “토큰 갱신 로직 강화”까지 포함하므로, 그 기준으로는 미완료입니다. |

> [백엔드 주석]
> 프론트가 refresh token을 전제로 세션 전략을 잡으면 실제 구현과 충돌합니다.
> 현재 기준은 `Authorization: Bearer {access_token}` 입니다.

---

## 4. 데이터 모델 (Models & Migrations)
추가적인 데이터 저장 요구사항이 있을 경우 수정이 필요합니다.

| 상태 | 파일 경로 | 주요 수정 내용 | 백엔드 검토 메모 |
| :---: | :--- | :--- | :--- |
| `[x]` | `backend/app/models_django.py` | 추천 결과 히스토리(`FormerRecommendation`)에 `reasoning_snapshot`, `match_score` 등 필드 추가 여부 검토 및 마이그레이션. | 이미 반영돼 있습니다. 관련 테스트도 현재 존재합니다. |

---

## 우선순위 권장사항
1.  **Serializer (인터페이스):** 프론트엔드 개발 가시성을 위해 필드명(camelCase) 및 필드 추가를 최우선 진행.
2.  **Enum (상태값):** 화면 분기 처리에 핵심적인 `next_action` 값 통일.
3.  **Service (로직):** 추천 품질 향상을 위한 `match`, `reasoning` 생성 로직 고도화.

> [백엔드 주석]
> 현재 시점에서는 “새 기능 추가”보다 아래가 더 우선이라고 보고 있습니다.
> 1. 이미 반영된 최신 응답 기준으로 프론트 문서를 다시 맞추기
> 2. `restricted_internal_store` 정책을 프론트에서 어떻게 소비할지 결정
> 3. 공통 error envelope 없이 DRF 기본 에러 형식으로 우선 연결할지 확인
> 4. refresh token 없이 access token 기준으로 우선 구현할지 확인
> 5. `next_action` 값을 실제 route에 어떻게 매핑할지 확정

---
**작성자:** Gemini CLI (Senior Backend Engineer)
