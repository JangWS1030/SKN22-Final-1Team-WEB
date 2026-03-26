# 프론트엔드 협의 요청사항

## 1. 인증 / 세션

- 토큰 저장 위치
  - `localStorage`
  - `sessionStorage`
- 로그인 유지 정책
  - 새로고침 시 자동 로그인 유지 여부
  - 만료 시 처리 방식
    - 자동 로그아웃
    - 재로그인 유도
    - refresh 시도 여부
- `Authorization` 헤더 주입 위치
  - 공통 fetch/axios wrapper
  - 화면별 직접 주입

---

## 2. 고객 화면 흐름

- `next_action` 값별 실제 이동 화면 매핑
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

---

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

---

## 4. 표시 / UX 정책

- `vector_only` 안내 문구를 어느 화면에 표시할지
- 이미지가 비어 있을 때 placeholder 처리 방식
- 에러 메시지를
  - 공통 토스트로 띄울지
  - 필드 단위로 보여줄지
- 빈 데이터 상태에서 보여줄 문구
  - 추천 없음
  - 이력 없음
  - 트렌드 없음

---

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

---

## 6. 왜 이 정보가 필요한가

현재 백엔드는 프론트 mock 구조를 최대한 흡수한 상태입니다.

즉,

- 어떤 endpoint를 호출할지
- 어떤 필드를 화면에 먼저 쓸지
- 상태값을 어떤 route / UI 분기로 소비할지

만 정해지면 프론트에서 mock을 실제 API로 바꾸는 작업을 바로 시작할 수 있습니다.
