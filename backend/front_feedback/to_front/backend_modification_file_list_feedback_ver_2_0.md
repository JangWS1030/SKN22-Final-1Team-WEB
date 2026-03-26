# MirrAI 백엔드 수정 대상 파일 리스트 (2026-03-25)

본 문서는 `backend_implementation_guide_2026-03-25.md` 가이드에 명시된 프론트엔드 요청 사항 및 API 규약을 준수하기 위해 수정이 필요한 백엔드 파일 리스트를 정리한 것입니다.

> [백엔드 주석]
> 원문 형식은 그대로 유지하고, 현재 backend 코드 기준 검토 의견만 주석으로 덧붙입니다.
> 큰 구조 충돌이 많다기보다, 문서 버전 차이와 일부 가정 차이가 실제 연동 리스크에 더 가깝습니다.

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
> - `django_serializers.py` 관련 요청은 방향이 맞습니다. 실제로 `match`, `reasoning`, `tags`, camelCase alias는 이미 상당 부분 반영돼 있습니다.
> - `admin_serializers.py` 관련 요청도 방향은 맞지만, `todaySummary`, `chartData` 등은 이미 현재 backend 응답에 들어 있습니다.
> - `django_views.py`의 “공통 에러 봉투(envelope)”는 아직 backend에 통일되어 있지 않습니다. 이 부분을 전제로 프론트가 구현하면 실제 응답과 충돌할 수 있습니다.
> - `admin_views.py`의 예외 처리 강화는 가능하지만, 현재는 `detail` 기반 오류 응답을 사용 중입니다.

---

## 2. 비즈니스 로직 및 서비스 (Services)
비즈니스 로직 및 상태값(Enum)을 프론트엔드 규약과 일치시키기 위한 수정입니다.

| 파일 경로 | 주요 수정 내용 |
| :--- | :--- |
| `backend/app/api/v1/services_django.py` | `get_current_recommendations`, `run_mirrai_analysis_pipeline` 등에서 `next_action`, `recommendation_mode` 등의 상태값을 규약과 일치시킴. 추천 엔진 결과에 `match`, `reasoning` 데이터 포함. |
| `backend/app/api/v1/admin_services.py` | 대시보드 및 트렌드 분석 API의 반환 데이터 가공 로직 수정. |
| `backend/app/api/v1/recommendation_logic.py` | AI 추천 엔진에서 생성하는 원시 데이터를 프론트엔드 규약 포맷으로 정제. |

> [백엔드 주석]
> - `services_django.py` 관련 요청은 대부분 이미 반영돼 있습니다.
>   - `recommendation_mode`, `next_action`
>   - `match`, `reasoning`
>   - `nextAction`, `recommendationMode`, `nextActions`, `captureRequiredForFullResult`, `imagePolicy` alias
> - `admin_services.py` 관련 요청도 상당 부분 이미 반영돼 있습니다.
>   - `todaySummary`, `summaryCards`, `topStylesToday`, `chartData`
>   - `customer`, `hairstyles`, `todayStyle`, `recommendedStyles`, `items`
> - 다만 최신 이미지 정책(`restricted_internal_store`)은 이 문서에 아직 반영되지 않았습니다.
>   이 부분이 실제 연동에서 가장 먼저 충돌할 수 있는 정책 차이입니다.

---

## 3. 인증 및 보안 (Authentication)
`Bearer` 토큰 체계 및 토큰 갱신 로직 강화를 위한 수정입니다.

| 파일 경로 | 주요 수정 내용 |
| :--- | :--- |
| `backend/app/api/v1/admin_auth.py` | `AdminTokenAuthentication` 클래스의 `Bearer` 접두사 처리 로직 및 토큰 유효성 검증 로직 점검. |

> [백엔드 주석]
> - `Bearer` 접두사 처리와 유효성 검증은 이미 동작 중입니다.
> - 다만 “토큰 갱신 로직(refresh)”은 현재 backend에 없습니다.
> - 따라서 프론트가 refresh token 흐름을 전제로 구현하면 실제 backend와 충돌합니다.

---

## 4. 데이터 모델 (Models & Migrations)
추가적인 데이터 저장 요구사항이 있을 경우 수정이 필요합니다.

| 파일 경로 | 주요 수정 내용 |
| :--- | :--- |
| `backend/app/models_django.py` | 추천 결과 히스토리(`FormerRecommendation`)에 `reasoning_snapshot`, `match_score` 등 필드 추가 여부 검토 및 마이그레이션. |

> [백엔드 주석]
> - `FormerRecommendation.reasoning_snapshot`, `match_score`는 이미 모델에 반영되어 있습니다.
> - 즉 이 항목은 “추가 검토”보다는 “현재 구현 확인”으로 보는 편이 더 정확합니다.

---

## 우선순위 권장사항
1.  **Serializer (인터페이스):** 프론트엔드 개발 가시성을 위해 필드명(camelCase) 및 필드 추가를 최우선 진행.
2.  **Enum (상태값):** 화면 분기 처리에 핵심적인 `next_action` 값 통일.
3.  **Service (로직):** 추천 품질 향상을 위한 `match`, `reasoning` 생성 로직 고도화.

> [백엔드 주석]
> - 우선순위 방향 자체는 동의합니다.
> - 다만 현재 시점에서는 “새로 구현할 것”보다 “최신 응답 기준으로 문서를 다시 맞출 것”의 비중이 더 큽니다.

---
**작성자:** Gemini CLI (Senior Backend Engineer)

---

## 후첨 답변 (Backend)

현재 backend 코드 기준으로 판단하면 아래처럼 정리됩니다.

### 1. 이미 반영된 것

- `match`, `reasoning`, `tags`
- `todaySummary`, `chartData`
- `reasoning_snapshot`, `match_score`
- `Bearer` 인증 처리
- 관리자 화면 alias
  - `customer`
  - `hairstyles`
  - `todayStyle`
  - `recommendedStyles`
  - `items`

### 2. 실제 충돌 가능성이 큰 것

1. 공통 error envelope 가정
- 현재 backend는 공통 `{ ok, error, message }` envelope를 쓰지 않습니다.
- validation error는 DRF 기본 필드별 에러, auth error는 `detail`입니다.

2. refresh token 가정
- 현재 backend는 refresh token 흐름이 없습니다.
- `Authorization: Bearer {access_token}` 기준으로만 구현 부탁드립니다.

3. 최신 이미지 정책 누락
- 현재 backend는 아래 정책을 사용합니다.
  - `asset_store`
    - 동의 시
    - 사용자 simulation 출력 가능
    - 관리자 이미지 확인 가능
  - `restricted_internal_store`
    - 미동의 시
    - 내부 저장은 가능
    - 사용자/admin 모두 이미지 비노출
  - `vector_only`
    - 이미지 자체 저장 안 함

4. 최신 customer alias 보강 반영 필요
- 현재 backend는 아래 alias도 함께 내려가도록 보강돼 있습니다.
  - `nextAction`
  - `recommendationMode`
  - `nextActions`
  - `captureRequiredForFullResult`
  - `imagePolicy`
  - `canRegenerateSimulation`

### 3. 프론트 쪽 문서 수정 권장사항

- “공통 error envelope 적용 필요” 문구는 현재 backend 기준과 다릅니다.
- “토큰 갱신 로직 강화 필요” 문구도 현재 backend 기준과 다릅니다.
- 최신 이미지 정책(`restricted_internal_store`)을 문서에 추가해 주세요.
- 이미 반영된 항목은 “추가 개발 필요”보다 “최신 응답 확인 필요”로 바꾸는 편이 정확합니다.

### 4. 우선 확인 요청

아래 4가지만 먼저 확인 부탁드립니다.

1. `restricted_internal_store` 정책을 프론트에서 그대로 소비 가능한지
2. 공통 error envelope 없이 DRF 기본 에러 형식으로 우선 연결 가능한지
3. refresh token 없이 access token 기준으로 우선 구현 가능한지
4. `next_action` 값을 실제 route에 어떻게 매핑할지

### 5. 참고 기준 문서

최신 기준은 아래 파일을 참고해 주세요.

- `front_request_message_ver_2_0.md`
- `front_api_contract_guide_ver_2_0.md`
