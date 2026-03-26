# 프론트엔드 협의 요청사항

안녕하세요. 백엔드 contract 정리를 최신 코드 기준으로 다시 맞췄습니다.

현재 기준으로 backend에서 먼저 반영한 내용은 아래와 같습니다.

- 고객 flow 응답에 camelCase alias를 추가 보강했습니다.
  - `nextAction`
  - `recommendationMode`
  - `nextActions`
  - `captureRequiredForFullResult`
  - `imagePolicy`
  - `canRegenerateSimulation`
- 이미지 정책은 아래 기준으로 동작합니다.
  - 동의 시: `asset_store`
    - 사용자 simulation 출력 가능
    - 관리자 이미지 확인 가능
  - 미동의 시: `restricted_internal_store`
    - 내부 저장은 가능
    - 사용자/admin 모두 이미지 비노출
  - 이미지 저장 비활성 시: `vector_only`
- 현재 backend는 공통 error envelope를 별도로 통일하지 않았습니다.
  - validation error: DRF 기본 필드별 에러
  - auth error: `detail`
- 현재 refresh token 흐름은 없습니다.
  - `Authorization: Bearer {access_token}` 기준으로만 연결 부탁드립니다.

**아래 항목들에 대한 프론트 기준을 공유 부탁드립니다.**

## 1. 인증 / 세션

- 토큰 저장 위치
  - `localStorage`
  - `sessionStorage`
- 로그인 유지 정책
  - 새로고침 시 자동 로그인 유지 여부
  - 만료 시 처리 방식
- `Authorization` 헤더 주입 위치
  - 공통 fetch/axios wrapper
  - 화면별 직접 주입
- refresh token 없이 access token 기준으로 우선 구현 가능한지

## 2. 고객 화면 흐름

- `next_action` / `nextAction` 값별 실제 이동 화면 매핑
  - `register`
  - `capture`
  - `client_input`
  - `dashboard`
- 촬영 화면 UX
  - 업로드 버튼 위치
  - 재촬영 버튼 위치
  - 업로드 실패 시 재시도 방식
- 추천 카드 표시 항목 우선순위
  - `match`
  - `reasoning`
  - `recommendationMode`
  - `captureRequiredForFullResult`
- `confirm / cancel` 이후 이동 화면
  - 메인 복귀
  - 완료 페이지 이동
  - 입력 단계 복귀

## 3. 관리자 화면

- 고객 목록에서 우선 노출할 필드
  - `lastVisit`
  - `surveyResults`
  - `designerNote`
  - `interactionStatusLabel`
- 고객 상세 섹션 우선순위
  - `clientSummary`
  - `recommendationHistory`
  - `designerNote`
  - `aiProfile`
- 대시보드 카드 / 차트 우선순위
  - `summaryCards`
  - `activeClientsPreview`
  - `topStylesToday`
  - `chartData`
- 추천 상세 화면에서
  - `todayStyle`
  - `recommendedStyles`
  - `items`
  를 각각 어떤 영역에 배치할지

## 4. 표시 / UX 정책

- `restricted_internal_store` 상태일 때
  - 사용자 화면에서 어떤 문구를 보여줄지
  - 관리자 화면에서 어떤 placeholder를 보여줄지
- 이미지가 비어 있을 때 placeholder 처리 방식
- 에러 메시지를
  - 공통 토스트로 띄울지
  - 필드 단위로 보여줄지
- 빈 데이터 상태에서 보여줄 문구
  - 추천 없음
  - 이력 없음
  - 트렌드 없음

## 5. 차트 / 소비 구조

- 관리자 차트에서 사용하는 라이브러리
  - Recharts
  - Chart.js
  - 기타
- 차트 컴포넌트가 기대하는 정확한 데이터 shape
- 프론트에서 실제 API를 호출할 파일 구조
  - fetch wrapper 위치
  - auth store / context 위치
  - admin/customer API 레이어 분리 여부

## 6. 현재 확인 요청 핵심

아래 4가지만 우선 확인 부탁드립니다.

1. `restricted_internal_store` 정책을 프론트에서 그대로 반영 가능한지
2. 공통 error envelope 없이 DRF 기본 에러 형식으로 우선 연결 가능한지
3. refresh token 없이 access token 기준으로 우선 구현 가능한지
4. `next_action` 값들을 실제 route에 어떻게 매핑할지

현재 backend는 프론트 mock 구조를 최대한 흡수한 상태입니다.
즉, 화면 기준과 소비 방식만 정해지면 mock을 실제 API로 바꾸는 작업을 바로 시작할 수 있습니다.
