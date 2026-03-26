# [MirrAI] 프론트엔드 연동용 API 가이드

본 문서는 프론트엔드 mock 데이터를 실제 API로 교체할 때 참고할 최신 대응표입니다.
현재 backend는 프론트 연동 비용을 줄이기 위해 snake_case와 camelCase alias를 함께 제공하는 응답이 있습니다.

---

## 0. 공통 규칙

### 인증 방식

```http
Authorization: Bearer {access_token}
```

- `access_token`은 고객 / 관리자 로그인 응답에서 내려옵니다.
- `token_type`은 현재 `bearer`입니다.
- 현재 refresh token 흐름은 없습니다.

### 날짜 / 시간 포맷

- 날짜형 필드
  - `YYYY-MM-DD`
  - 예: `2026-03-25`
- datetime 필드
  - ISO 8601 + timezone offset
  - 예: `2026-03-25T10:30:00+09:00`

### 상태값 공통 원칙

- 초기 연동 단계에서는 snake_case와 camelCase alias가 함께 내려올 수 있습니다.
- 프론트에서는 한쪽 규칙으로 정해서 소비해도 됩니다.
- `next_action` / `nextAction`
  - 다음 화면 이동용 값입니다.
- `current_step` / `currentStep`
  - 현재 진행 상태 표시용 값입니다.

### empty state

- 배열형 데이터는 가능한 한 `[]`
- 수치형 데이터는 가능한 한 `0`
- 일부 날짜/참조 필드는 `null` 가능

### pagination

- 현재 `admin/clients`를 포함해 별도 pagination은 없습니다.
- `limit / offset / page` 파라미터는 현재 지원하지 않습니다.

### 에러 응답

- 공통 error envelope는 아직 별도로 통일하지 않았습니다.
- validation error는 DRF 기본 형식으로 내려올 수 있습니다.
  - 예: `{ "phone": ["..."] }`
- 인증 오류는 `detail` 필드가 내려올 수 있습니다.
  - 예: `{ "detail": "Authorization header must use Bearer token." }`

### HTTP 상태 코드

- `200`: 정상 처리
- `400`: 입력 오류 / 검증 실패
- `401`: 인증 실패
- `403`: 권한 없음
- `404`: 리소스 없음
- `500`: 서버 오류

---

## 1. 상태값 enum

### next_action / nextAction

현재 코드 기준 주요 값:

- `register`
- `capture`
- `client_input`
- `dashboard`
- `admin_dashboard`

### recommendation_mode / recommendationMode

현재 코드 기준 주요 값:

- `history`
- `capture_required`
- `needs_input`
- `survey_only`
- `capture_analysis`
- `trend`

설명:

- `survey_only`: 설문만으로 만든 임시 추천
- `capture_analysis`: 촬영/분석까지 반영한 추천
- `capture_required`: 촬영이 더 필요함
- `needs_input`: 설문/입력이 더 필요함

### current_step / currentStep

현재 코드 기준 주요 값:

- `survey`
- `capture`
- `recommendation`
- `consultation`
- `client_input`
- `completed`

### interaction_status / interactionStatus

현재 코드 기준 주요 값:

- `awaiting_client_input`
- `survey_complete`
- `capture_complete`
- `needs_retake`
- `survey_recommendations_ready`
- `recommendations_ready`
- `style_confirmed`
- `confirmed_waiting_admin`
- `consultation_in_progress`
- `selection_cancelled`
- `consultation_closed`

### consultation_status / consultationStatus

현재 코드 기준 주요 값:

- `PENDING`
- `IN_PROGRESS`
- `CLOSED`
- `CANCELLED`

### image_policy / imagePolicy

현재 코드 기준 주요 값:

- `asset_store`
- `restricted_internal_store`
- `vector_only`
- `legacy_asset_store`

설명:

- `asset_store`
  - 이미지 저장 + 사용자 simulation 출력 가능 + 관리자 이미지 확인 가능
- `restricted_internal_store`
  - 내부 저장은 가능하지만 사용자/admin 모두 이미지 비노출
- `vector_only`
  - 이미지 자체를 저장하지 않음, 분석/벡터 중심
- `legacy_asset_store`
  - 과거 recommendation/history row에서 내려올 수 있는 레거시 케이스

렌더링 원칙:

- 프론트에서 이미지 표시 여부는 `image_policy` / `imagePolicy`를 기준으로 판단해 주세요.

---

## 2. 고객 인증

### 회원가입
- `POST /api/v1/auth/register/`

### 로그인
- `POST /api/v1/auth/login/`

### 기존 client 확인 / 인증 체크
- `POST /api/v1/auth/check/`

### 현재 사용자 조회
- `GET /api/v1/auth/me/`

주요 응답 필드:

- `is_authenticated`
- `is_existing`
- `next_action`
- `nextAction`
- `client`
- `clientSummary`
- `access_token`
- `token_type`
- `expires_in`

---

## 3. 고객 플로우

### 설문 제출
- `POST /api/v1/survey/`

요청:

- `selections` 객체 전송 가능
- 명시 필드가 같이 들어오면 명시 필드 우선

응답:

- `status`
- `next_action`
- `nextAction`
- `selection_snapshot`

### 촬영 업로드
- `POST /api/v1/capture/upload/`

응답:

- `status`
- `record_id`
- `image_policy`
- `imagePolicy`
- `privacy_snapshot`

비고:

- 동의 시: `asset_store`
- 미동의 시: `restricted_internal_store`
- 저장 비활성 시: `vector_only`

### 촬영 상태 조회
- `GET /api/v1/capture/status/`

응답:

- `status`
- `next_action`
- `nextAction`
- `image_storage_policy`
- `image_policy`
- `imagePolicy`
- `client_can_view_simulation`
- `deidentified_image_url`

### 현재 추천 조회
- `GET /api/v1/analysis/recommendations/`

응답:

- `recommendation_mode`
- `recommendationMode`
- `capture_required_for_full_result`
- `captureRequiredForFullResult`
- `next_action`
- `nextAction`
- `next_actions`
- `nextActions`
- 추천 카드 배열

추천 카드 주요 필드:

- `name`
- `imageUrl`
- `match`
- `tags`
- `reasoning`
- `image_policy`
- `imagePolicy`
- `can_regenerate_simulation`
- `canRegenerateSimulation`

비고:

- 촬영 전 설문만으로 추천될 경우 `recommendation_mode = "survey_only"`

### 과거 추천 이력
- `GET /api/v1/analysis/former-recommendations/`

응답:

- `recommendation_mode`
- `recommendationMode`
- recommendation history row 목록

### 트렌드 조회
- `GET /api/v1/analysis/trend/`

응답:

- `recommendation_mode`
- `recommendationMode`
- trend 데이터

### 스타일 확정
- `POST /api/v1/analysis/confirm/`

응답:

- `current_step`
- `currentStep`
- `interaction_status`
- `interactionStatus`
- `consultation_status`
- `consultationStatus`
- `idempotent`

비고:

- `idempotent = true`
  - 이미 처리된 요청이 다시 들어온 경우
  - 새 이력을 또 만들지 않고 기존 처리 결과를 재사용

### 스타일 취소
- `POST /api/v1/analysis/cancel/`

응답:

- `next_action`
- `nextAction`
- `current_step`
- `currentStep`
- `interaction_status`
- `interactionStatus`
- `consultation_status`
- `consultationStatus`
- `idempotent`

비고:

- 취소 후 관리자 집계 / 상태에도 반영
- `idempotent = true`
  - 이미 취소된 요청이 다시 들어온 경우
  - 상태를 한 번 더 깨뜨리지 않고 같은 결과를 안전하게 반환

### 추천 시뮬레이션 재생성
- `POST /api/v1/analysis/regenerate-simulation/`

응답:

- 재생성된 추천 / 시뮬레이션 결과
- `image_policy`
- `imagePolicy`
- `can_regenerate_simulation`
- `canRegenerateSimulation`

비고:

- 미동의 시 `restricted_internal_store` 정책으로 인해 simulation image가 노출되지 않을 수 있습니다.

---

## 4. 관리자 인증

### 관리자 등록
- `POST /api/v1/admin/auth/register/`

### 관리자 로그인
- `POST /api/v1/admin/auth/login/`

### 현재 관리자 조회
- `GET /api/v1/admin/auth/me/`

주요 응답 필드:

- `is_authenticated`
- `next_action`
- `displayName`
- `storeName`
- `businessNumber`

---

## 5. 관리자 화면 API

### 대시보드
- `GET /api/v1/admin/dashboard/`

주요 응답 필드:

- `todaySummary`
- `summaryCards`
- `topStylesToday`
- `activeClientsPreview`
- `chartData`

### 활성 client 목록
- `GET /api/v1/admin/clients/active/`

주요 응답 필드:

- 활성 client 카드 목록
- 공통 상태 필드 포함

### 전체 client 목록
- `GET /api/v1/admin/clients/`

주요 응답 필드:

- `id`
- `isNew`
- `lastVisit`
- `todayRecommendationId`
- `todayRecommendationName`
- `surveyResults`
- `designerNote`
- 상태 필드들

nullable / empty 규칙:

- `lastVisit`: `null` 가능
- `designerNote`: 데이터 없으면 빈 문자열

### client 상세
- `GET /api/v1/admin/clients/detail/`

주요 응답 필드:

- `clientSummary`
- `customer`
- `recommendationHistory`
- `designerNote`
- `totalSessions`

비고:

- 프론트 mock 구조 호환을 위해 `customer` alias 제공
- 미동의 client의 경우 capture image URL은 `null`로 내려갈 수 있습니다.

### client 추천 상세
- `GET /api/v1/admin/clients/recommendations/`

주요 응답 필드:

- `clientSummary`
- `customer`
- `surveyResults`
- `aiProfile`
- `todayStyle`
- `todayStyleSource`
- `recommendedStyles`
- `recommendedStylesPurpose`
- `items`
- `itemsPurpose`
- `hairstyles`
- `recommendationMode`
- `captureRequiredForFullResult`

비고:

- `todayStyle`은 추천 batch의 1순위 추천 기준
- `recommendedStyles`는 프론트 카드용
- `items`는 raw recommendation row 성격
- `hairstyles`는 mock 대체용 alias
- UI 렌더링은 우선 `recommendedStyles` 기준으로 사용해 주세요.
- `items`는 내부/raw 성격의 상세 row로 이해해 주세요.

### 상담 메모 저장
- `POST /api/v1/admin/consultations/note/`

### 상담 종료
- `POST /api/v1/admin/consultations/close/`

### 트렌드 리포트
- `GET /api/v1/admin/trend-report/`

주요 응답 필드:

- `trendReport`
- `hairstyles`
- `chartData`

비고:

- 취소 건은 통계에서 제외

### 스타일 리포트
- `GET /api/v1/admin/style-report/`

주요 응답 필드:

- `hairstyle`
- `relatedHairstyles`

---

## 6. 관리자 공통 상태 필드

- `current_step`
- `currentStep`
- `interaction_status`
- `interactionStatus`
- `interaction_status_label`
- `interactionStatusLabel`
- `consultation_status`
- `consultationStatus`

설명:

- `interaction_status_label`은 화면에 바로 표시할 한글 상태값 용도
- `interaction_status`는 상태 분기용
- `current_step`은 현재 단계 표시용

---

## 7. 현재 상태 요약

- backend contract: 주요 구조 정리 완료
- 관리자 화면: mock -> API 전환 가능 수준
- 고객 화면: route / auth / recommendation 중심 contract 정리 완료
- 주의점:
  - 공통 error envelope 없음
  - refresh token 없음
  - 미동의 이미지 정책은 `restricted_internal_store`
