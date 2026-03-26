# 프론트엔드 결정 요청

안녕하세요. 백엔드는 현재 기준 계약을 유지한 채 연동 준비를 마친 상태입니다.
아래 3가지는 프론트 기준을 받아야 최종 계약을 확정할 수 있어, 우선 선택 요청드립니다.

---

## 1. 공통 에러 응답 형식

### 현재 backend 기본값
- validation error: DRF 기본 필드 에러
  - 예: `{ "phone": ["..."] }`
- auth / permission error: `detail`
  - 예: `{ "detail": "Authorization header must use Bearer token." }`

### 선택안
- A안
  - 현재 형식 그대로 우선 연동
  - 프론트에서 validation / detail 두 형식을 나눠 처리
- B안
  - backend가 공통 error envelope를 추가 구현
  - 예: `{ "ok": false, "error": "...", "message": "...", "fields": {...} }`

### 백엔드 권장
- `A안`
- 이유: 지금 바로 붙이기 가장 빠르고, 이미 현재 응답 기준 테스트도 고정해둔 상태입니다.

---

## 2. 관리자 예외 응답 통일 방식

### 현재 backend 기본값
- 관리자 read 응답 shape는 대부분 맞춰둔 상태입니다.
- 다만 관리자 예외 응답은 DRF 기본 형식 / `detail` 기반입니다.

### 선택안
- A안
  - 관리자도 현재 `detail` 기반 예외 응답으로 우선 연동
- B안
  - 관리자 API만 별도 wrapper를 먼저 도입
  - 관리자 영역에서만 공통 예외 응답 구조 사용

### 백엔드 권장
- `A안`
- 이유: 고객/admin 에러 형식을 당장 다르게 가져가면 프론트 공통 처리도 오히려 복잡해질 수 있습니다.

---

## 3. refresh token 도입 여부

### 현재 backend 기본값
- 현재 인증은 `Authorization: Bearer {access_token}` 기준입니다.
- refresh token 흐름은 아직 없습니다.

### 선택안
- A안
  - 우선 access token만으로 연동
  - 만료 시 재로그인 또는 세션 초기화
- B안
  - refresh token을 이번 연동 범위에 포함
  - backend에서 refresh endpoint / 정책 추가 구현 필요

### 백엔드 권장
- `A안`
- 이유: 지금 범위에서 가장 적게 흔들리고, 프론트/백엔드 모두 바로 연결을 시작할 수 있습니다.

---

## 빠른 회신 요청

아래처럼 3줄만 답 주셔도 됩니다.

- 에러 응답: A안 / B안
- 관리자 예외 응답: A안 / B안
- refresh token: A안 / B안

현재 backend는 `A안 / A안 / A안`을 기본값으로 유지하고 있습니다.
