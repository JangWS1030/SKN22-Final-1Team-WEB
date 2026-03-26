# [MirrAI] 프론트엔드 연동용 API 가이드

기준일: 2026-03-25

본 문서는 프론트엔드 mock 데이터를 실제 API로 교체할 때 참고할 대응표입니다.
현재 백엔드는 프론트 연동 비용을 줄이기 위해 alias와 상태 필드를 함께 제공합니다.

---

## 0. 공통 규칙

### 인증 방식

- 인증이 필요한 API는 아래 헤더를 사용합니다.

```http
Authorization: Bearer {access_token}
```

- `access_token`은 고객 / 관리자 로그인 응답에서 내려옵니다.
- `token_type`은 현재 `bearer`입니다.

### 날짜 / 시간 포맷

- 날짜형 필드
  - `YYYY-MM-DD`
  - 예: `2026-03-25`
- datetime 필드
  - ISO 8601 + timezone offset
  - 예: `2026-03-25T10:30:00+09:00`

### 상태값 공통 원칙

- snake_case와 camelCase alias가 함께 내려올 수 있습니다.
- 프론트에서는 한쪽 규칙을 정해서 소비하되, 초기 연동 시에는 두 형태가 모두 있을 수 있습니다.

### empty state

- 배열형 데이터는 가능한 한 `[]`
- 수치형 데이터는 가능한 한 `0`
- 일부 날짜/참조 필드는 `null` 가능

### pagination

- 현재 `admin/clients`를 포함해 별도 pagination은 붙어 있지 않습니다.
- `limit / offset / page` 파라미터는 현재 지원하지 않습니다.

### 에러 응답

- 현재 공통 error envelope는 별도로 통일되어 있지 않습니다.
- 검증 오류는 DRF 기본 형식으로 내려올 수 있습니다.
  - 예: `{ "phone_number": ["..."] }`
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

---

## 2. 고객 인증

### 회원가입

- `POST /api/v1/auth/register/`

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

### 로그인

- `POST /api/v1/auth/login/`

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

### 기존 client 확인 / 인증 체크

- `POST /api/v1/auth/check/`

주요 응답 필드:

- `is_authenticated`
- `is_existing`
- `next_action`
- `nextAction`
- `client`
- `clientSummary`

비고:

- 기존 client 여부 확인과 다음 단계 분기용으로 사용 가능

### 현재 사용자 조회

- `GET /api/v1/auth/me/`

주요 응답 필드:

- `is_authenticated`
- `is_existing`
- `next_action`
- `nextAction`
- `client`
- `clientSummary`

---

## 3. 고객 플로우

### 설문 제출

- `POST /api/v1/survey/`

요청:

- `selections` 배열 전송 가능
- 명시 필드가 같이 들어오면 명시 필드 우선

응답:

- `status`
- `next_action`
- `nextAction`

### 촬영 업로드

- `POST /api/v1/capture/upload/`

응답:

- `status`
- `record_id`
- `image_policy`

비고:

- 동의 기반 저장 정책과 `vector_only` 정책 반영

### 촬영 상태 조회

- `GET /api/v1/capture/status/`

응답:

- `status`
- `needs_retake` 관련 상태

### 현재 추천 조회

- `GET /api/v1/analysis/recommendations/`

응답:

- `recommendation_mode`
- `capture_required_for_full_result`
- 추천 카드 배열

추천 카드 주요 필드:

- `name`
- `imageUrl`
- `match`
- `tags`

비고:

- 촬영 전 설문만으로 추천될 경우 `recommendation_mode = "survey_only"`

### 과거 추천 이력

- `GET /api/v1/analysis/former-recommendations/`

응답:

- 추천 이력 목록
- 재생성 관련 snapshot 기반 데이터

### 트렌드 조회

- `GET /api/v1/analysis/trend/`

응답:

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

- 중복 호출 방지 처리 반영
- `idempotent = true`
  - 이미 처리된 요청이 다시 들어온 경우
  - 새 이력을 또 만들지 않고 기존 처리 결과를 재사용

### 스타일 취소

- `POST /api/v1/analysis/cancel/`

응답:

- `next_action`
- `nextAction`
- `current_step`
- `interaction_status`
- `consultation_status`
- `idempotent`

비고:

- 취소 후 관리자 집계 / 상태에도 반영
- `idempotent = true`
  - 이미 취소된 요청이 다시 들어온 경우
  - 상태를 한 번 더 깨뜨리지 않고 안전하게 같은 결과를 반환

### 추천 시뮬레이션 재생성

- `POST /api/v1/analysis/regenerate-simulation/`

응답:

- 재생성된 추천 / 시뮬레이션 결과

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

- backend contract: 대부분 정리 완료
- 관리자 화면: mock -> API 전환 가능 수준
- 고객 화면: route / auth / recommendation 수준 contract 확정
- 남은 핵심: 프론트 소비 코드 작성과 화면 기준 확정
