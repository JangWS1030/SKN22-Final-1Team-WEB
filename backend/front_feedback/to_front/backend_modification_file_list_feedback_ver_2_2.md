# MirrAI 백엔드 수정 대상 파일 리스트 (2026-03-25)

본 문서는 `backend_implementation_guide_2026-03-25.md` 가이드에 명시된 프론트엔드 요청 사항 및 API 규약을 준수하기 위해 수정이 필요한 백엔드 파일 리스트를 정리한 것입니다.

> [백엔드 주석]
> 원문 구조는 그대로 유지하고, 현재 backend 코드 기준 상태를 각 섹션에 바로 주석으로 반영합니다.
> 이번 버전은 별도 후첨 없이, 주석만으로 판단과 최신 기준을 모두 담는 방향입니다.

---

## 1. API 인터페이스 및 규약 (Serializers & Views)
프론트엔드와 약속한 `camelCase` 필드 및 공통 에러 응답을 적용하기 위해 수정해야 할 핵심 파일입니다.

| 파일 경로 | 주요 수정 내용 |
| :--- | :--- |
| `backend/app/api/v1/django_serializers.py` | `ClientRegisterSerializer`, `RecommendationListResponseSerializer` 등에 `camelCase` alias 필드 추가. `match`, `reasoning`, `tags` 등 추천 결과 필드 추가. |
| `backend/app/api/v1/admin_serializers.py` | 관리자 대시보드 데이터 포맷 수정 (`todaySummary`, `chartData` 등 프론트엔드 차트 매핑 구조 최적화). |
| `backend/app/api/v1/django_views.py` | 모든 API 응답에서 공통 에러 봉투(`envelope`) 구조 적용 및 Enum 값(Next Action 등) 반환 로직 점검. |
| `backend/app/api/v1/admin_views.py` | 관리자 전용 API의 응답 구조 통일 및 예외 처리 강화. |

> [백엔드 주석]
> - `django_serializers.py`
>   - 방향은 맞습니다.
>   - `match`, `reasoning`, `tags`, camelCase alias는 이미 상당 부분 반영되어 있습니다.
>   - 현재 고객 flow 쪽도 `nextAction`, `recommendationMode`, `imagePolicy` 등 alias를 추가 반영한 상태입니다.
> - `admin_serializers.py`
>   - 방향은 맞습니다.
>   - 다만 `todaySummary`, `chartData`는 이미 현재 backend 응답에 포함되어 있습니다.
>   - 이 항목은 “추가 개발 필요”보다 “최신 구현 확인”에 더 가깝습니다.
> - `django_views.py`
>   - `Next Action` 관련 응답 보강은 최신 기준으로 반영되어 있습니다.
>   - 다만 “공통 에러 봉투(envelope)”는 아직 backend에 통일되어 있지 않습니다.
>   - 현재는 validation error는 DRF 기본 필드별 에러, auth error는 `detail` 기반입니다.
>   - 따라서 프론트가 공통 `{ ok, error, message }` 형태를 전제로 구현하면 실제 응답과 충돌할 수 있습니다.
> - `admin_views.py`
>   - 예외 처리 강화는 가능하지만, 현재는 `detail` 기반 오류 응답을 유지 중입니다.
>   - 응답 구조는 관리자 contract 기준으로 이미 많이 정리된 상태입니다.

---

## 2. 비즈니스 로직 및 서비스 (Services)
비즈니스 로직 및 상태값(Enum)을 프론트엔드 규약과 일치시키기 위한 수정입니다.

| 파일 경로 | 주요 수정 내용 |
| :--- | :--- |
| `backend/app/api/v1/services_django.py` | `get_current_recommendations`, `run_mirrai_analysis_pipeline` 등에서 `next_action`, `recommendation_mode` 등의 상태값을 규약과 일치시킴. 추천 엔진 결과에 `match`, `reasoning` 데이터 포함. |
| `backend/app/api/v1/admin_services.py` | 대시보드 및 트렌드 분석 API의 반환 데이터 가공 로직 수정. |
| `backend/app/api/v1/recommendation_logic.py` | AI 추천 엔진에서 생성하는 원시 데이터를 프론트엔드 규약 포맷으로 정제. |

> [백엔드 주석]
> - `services_django.py`
>   - 문서 방향은 맞고, 대부분 이미 반영되어 있습니다.
>   - 현재 응답에는 아래도 포함됩니다.
>     - `nextAction`
>     - `recommendationMode`
>     - `nextActions`
>     - `captureRequiredForFullResult`
>     - `imagePolicy`
>     - `canRegenerateSimulation`
>   - `confirm / cancel` 이후 상태 동기화, idempotent 처리도 반영되어 있습니다.
> - `admin_services.py`
>   - 대시보드/트렌드뿐 아니라 관리자 목록/상세/추천 상세 구조도 현재 상당 부분 정리되어 있습니다.
>   - 예:
>     - `todaySummary`
>     - `summaryCards`
>     - `topStylesToday`
>     - `chartData`
>     - `customer`
>     - `todayStyle`
>     - `recommendedStyles`
>     - `items`
>     - `hairstyles`
> - `recommendation_logic.py`
>   - `match`, `reasoning`, `reasoning_snapshot`, `match_score`는 이미 생성되고 있습니다.
>   - 따라서 이 부분도 “신규 구현 필요”보다 “현재 생성 규칙 확인”에 가깝습니다.
> - 최신 정책 기준 추가 주의:
>   - 현재 이미지 정책은 `vector_only`만 있는 상태가 아닙니다.
>   - 최신 backend는 아래 정책을 사용합니다.
>     - `asset_store`
>     - `restricted_internal_store`
>     - `vector_only`
>   - 특히 `restricted_internal_store`는 내부 저장 가능하지만 사용자/admin 모두 이미지 비노출이라는 점을 프론트가 알아야 합니다.

---

## 3. 인증 및 보안 (Authentication)
`Bearer` 토큰 체계 및 토큰 갱신 로직 강화를 위한 수정입니다.

| 파일 경로 | 주요 수정 내용 |
| :--- | :--- |
| `backend/app/api/v1/admin_auth.py` | `AdminTokenAuthentication` 클래스의 `Bearer` 접두사 처리 로직 및 토큰 유효성 검증 로직 점검. |

> [백엔드 주석]
> - `Bearer` 접두사 처리와 유효성 검증은 이미 동작 중입니다.
> - 다만 현재 backend는 refresh token 흐름이 없습니다.
> - 따라서 “토큰 갱신 로직 강화”를 현재 필수 전제로 보면 실제 구현과 차이가 생깁니다.
> - 프론트는 우선 `Authorization: Bearer {access_token}` 기준으로 연결해 주셔야 합니다.

---

## 4. 데이터 모델 (Models & Migrations)
추가적인 데이터 저장 요구사항이 있을 경우 수정이 필요합니다.

| 파일 경로 | 주요 수정 내용 |
| :--- | :--- |
| `backend/app/models_django.py` | 추천 결과 히스토리(`FormerRecommendation`)에 `reasoning_snapshot`, `match_score` 등 필드 추가 여부 검토 및 마이그레이션. |

> [백엔드 주석]
> - `FormerRecommendation.reasoning_snapshot`, `match_score`는 이미 모델에 반영되어 있습니다.
> - 관련 테스트도 현재 존재합니다.
> - 이 항목은 “추가 여부 검토”보다 “현재 구현 확인”으로 보는 편이 정확합니다.

---

## 우선순위 권장사항
1.  **Serializer (인터페이스):** 프론트엔드 개발 가시성을 위해 필드명(camelCase) 및 필드 추가를 최우선 진행.
2.  **Enum (상태값):** 화면 분기 처리에 핵심적인 `next_action` 값 통일.
3.  **Service (로직):** 추천 품질 향상을 위한 `match`, `reasoning` 생성 로직 고도화.

> [백엔드 주석]
> - 우선순위 방향 자체는 동의합니다.
> - 다만 현재 시점에서는 아래처럼 보는 것이 더 정확합니다.
>   1. 이미 구현된 alias/enum/추천 필드의 최신 응답 기준을 먼저 확인
>   2. 최신 이미지 정책(`restricted_internal_store`)을 프론트에서 어떻게 소비할지 먼저 확정
>   3. 공통 error envelope와 refresh token은 “현재 없음” 기준으로 우선 연동
> - 즉, 지금은 “새 기능 추가”보다 “최신 contract 기준 정렬”이 우선입니다.
> - 프론트가 먼저 확인해주면 좋은 핵심은 아래 4가지입니다.
>   - `restricted_internal_store` 정책을 그대로 소비 가능한지
>   - 공통 error envelope 없이 DRF 기본 에러 형식으로 우선 연결 가능한지
>   - refresh token 없이 access token 기준으로 우선 구현 가능한지
>   - `next_action` 값을 실제 route에 어떻게 매핑할지

---
**작성자:** Gemini CLI (Senior Backend Engineer)
