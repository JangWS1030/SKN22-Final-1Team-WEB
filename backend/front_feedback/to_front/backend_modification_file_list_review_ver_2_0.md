# backend_modification_file_list 검토 의견

안녕하세요. 전달해주신 [backend_modification_file_list] 문서를 현재 backend 코드 기준으로 대조해 검토했습니다.

결론부터 말씀드리면, 문서 전반의 방향은 맞지만 **현재 backend와 이미 반영된 내용 / 아직 없는 내용 / 최신 정책이 반영되지 않은 내용**이 섞여 있습니다.
즉, 큰 구조 충돌이 많다기보다는 **문서 버전 차이와 일부 가정 차이**가 실제 연동 리스크에 더 가깝습니다.

---

## 1. 우선 수정이 필요한 항목

### 1) 공통 error envelope 가정

- 문서 기준
  - `backend/app/api/v1/django_views.py`에서 모든 API 응답에 공통 error envelope 적용 필요
- 현재 backend 기준
  - 공통 error envelope는 아직 통일되어 있지 않습니다.
  - validation error는 DRF 기본 필드별 에러
  - auth error는 `detail`
- 따라서 프론트에서 공통 `{ ok, error, message }` 형태를 전제로 구현하면 실제 응답과 충돌합니다.

### 2) refresh token / token 갱신 가정

- 문서 기준
  - `Bearer` 토큰 체계 및 토큰 갱신 로직 강화 필요
- 현재 backend 기준
  - `Bearer access_token`은 지원
  - refresh token 흐름은 현재 없습니다.
- 따라서 프론트에서 refresh token 기반 세션 전략을 전제로 구현하면 실제 backend와 충돌합니다.

### 3) 최신 이미지 정책 누락

- 문서에는 최신 `image_policy` 정책이 반영되지 않았습니다.
- 현재 backend 기준
  - 동의 시: `asset_store`
  - 미동의 시: `restricted_internal_store`
    - 내부 저장은 가능
    - 사용자/admin 모두 이미지 비노출
  - 저장 비활성 시: `vector_only`
- 이 부분은 실제 렌더링/placeholder/UI 분기와 바로 연결되므로, 현재 문서에서 가장 먼저 보완되어야 하는 항목입니다.

### 4) 이미 반영된 항목이 “추가 수정 필요”로 남아 있는 부분

아래 항목은 현재 backend에 이미 상당 부분 반영되어 있습니다.

- `todaySummary`, `chartData`
- `match`, `reasoning`, `tags`
- `recommendation_mode`
- `reasoning_snapshot`, `match_score`
- `Bearer` 접두사 검증

즉, 이 항목들은 “신규 개발 필요”보다 “현재 구현 기준 확인”으로 표현하는 편이 더 정확합니다.

---

## 2. 현재 backend 기준 실제 리스크

실제 연동 시 충돌 가능성이 큰 건 아래 쪽입니다.

1. customer flow 일부 응답의 alias / enum 해석
2. 이미지 정책(`restricted_internal_store`) 해석
3. 공통 error envelope 부재
4. refresh token 부재

반대로 아래는 현재 backend 쪽에서 이미 많이 흡수된 상태입니다.

- 관리자 대시보드 / 목록 / 상세 / 추천 상세 구조
- 추천 카드 alias
- 상태값 enum
- `todayStyle`, `recommendedStyles`, `items`, `hairstyles`

---

## 3. 현재 backend에서 이미 반영한 보완

최신 backend 기준으로는 아래가 이미 반영되어 있습니다.

- customer flow 응답 alias 보강
  - `nextAction`
  - `recommendationMode`
  - `nextActions`
  - `captureRequiredForFullResult`
  - `imagePolicy`
  - `canRegenerateSimulation`
- 관리자 응답 alias 및 카드 구조
  - `todaySummary`
  - `summaryCards`
  - `chartData`
  - `customer`
  - `hairstyles`
- 이미지 정책 반영
  - `restricted_internal_store`
  - 미동의 시 사용자/admin 이미지 비노출

---

## 4. 프론트 쪽 문서 수정 권장사항

현재 문서는 아래 기준으로 고치면 실제 연동 기준에 더 가까워집니다.

1. “공통 error envelope 적용 필요” 문구 삭제 또는 보류 표기
2. “token 갱신 로직 강화” 문구 삭제 또는 보류 표기
3. `image_policy` 최신값과 의미 추가
   - `asset_store`
   - `restricted_internal_store`
   - `vector_only`
4. 이미 반영된 항목은 “추가 개발 필요”가 아니라 “최신 응답 확인 필요”로 수정
5. 기준 문서는 아래 최신 파일로 맞춰주시면 좋겠습니다.
   - `front_request_message_ver_2_0.md`
   - `front_api_contract_guide_ver_2_0.md`

---

## 5. 요청드리는 확인 사항

프론트에서는 아래 4가지만 먼저 확인 부탁드립니다.

1. `restricted_internal_store` 정책을 그대로 소비 가능한지
2. 공통 error envelope 없이 DRF 기본 에러 형식으로 우선 연결 가능한지
3. refresh token 없이 access token 기준으로 우선 구현 가능한지
4. `next_action` 값을 실제 route에 어떻게 매핑할지

위 4가지만 정리되면 mock -> API 교체 과정에서 실제 충돌은 많이 줄어들 것으로 보고 있습니다.
