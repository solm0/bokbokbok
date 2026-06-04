# BOK3 웹사이트 운영/개발 안내

이 문서는 BOK3 웹사이트를 운영하거나 수정하는 사람이 알아야 할 핵심 정보를 정리한 문서입니다.

현재 사이트는 다음 구조로 동작합니다.

- 프론트엔드: `React + Vite`
- 진 목록 데이터: 로컬 JSON
- 진 이미지: 로컬 파일
- 구매 요청 저장: `Google Apps Script -> Google Spreadsheet`
- 구매 요청 확인 메일 발송: `Google Apps Script -> Gmail`

## 1. 자주 수정하는 파일

운영 중 가장 자주 손대는 파일은 아래 4개입니다.
솔미 짱! ///

- 진 목록 데이터: [public/zines.json](/Users/solmi/Downloads/bokbokbok/public/zines.json)
- 구매 요청 전송 URL 설정: [.env](/Users/solmi/Downloads/bokbokbok/.env)
- Apps Script 코드: [apps-script/purchase-request.gs](/Users/solmi/Downloads/bokbokbok/apps-script/purchase-request.gs)
- Apps Script 설정 가이드: [APPS_SCRIPT_SETUP.md](/Users/solmi/Downloads/bokbokbok/APPS_SCRIPT_SETUP.md)

## 2. 개발 서버 실행 방법

로컬에서 사이트를 확인하려면:

```bash
npm install
npm run dev
```

배포 전 빌드 확인:

```bash
npm run build
```

## 3. 진 목록 수정 방법

진 목록은 [public/zines.json](/Users/solmi/Downloads/bokbokbok/public/zines.json)에서 관리합니다.

각 진은 대략 이런 구조입니다.

```json
{
  "id": "1",
  "title": "Placeholder Zine 01",
  "description": "설명",
  "price": 12000,
  "available": true,
}
```

각 필드 의미:

- `id`
  각 진의 고유 번호입니다. 문자열로 관리합니다.
- `title`
  진 제목입니다.
- `description`
  진 설명입니다. 상세 페이지와 장바구니에 표시됩니다.
- `price`
  가격입니다. 숫자로 넣습니다.
- `available`
  판매 가능 여부입니다.
  `true`면 목록에 보이고 상세 페이지에서 장바구니에 담을 수 있습니다.
  `false`면 `DIG` 목록에서 제외됩니다.

### 진 추가 방법

1. [public/zines.json](/Users/solmi/Downloads/bokbokbok/public/zines.json)에 새 객체를 추가합니다.
2. `id`는 기존과 겹치지 않게 넣습니다.
3. 제목, 설명, 가격을 입력합니다.
4. 이미지가 준비됐다면 아래 규칙에 맞춰 파일도 추가합니다.

### 진 숨기기 / 판매중지 방법

`available`을 `false`로 바꾸면 됩니다.

예:

```json
{
  "id": "8",
  "title": "Zine 08",
  "description": "설명",
  "price": 15000,
  "available": false,
}
```

## 4. 진 이미지 파일 경로

진 이미지는 현재 코드상 자동 규칙으로 불러옵니다.
해당 로직은 [src/hooks/useZines.js](/Users/solmi/Downloads/bokbokbok/src/hooks/useZines.js)에 있습니다.

규칙은 다음과 같습니다.

### 표지 이미지

```text
/images/zines/{id}_cover.png
```

예:

```text
/images/zines/1_cover.png
/images/zines/25_cover.png
```

실제 파일 위치:

```text
/Users/solmi/Downloads/bokbokbok/public/images/zines/
```

즉, 파일은 이 폴더에 넣어야 합니다.

예:

- [1_cover.png](/Users/solmi/Downloads/bokbokbok/public/images/zines/1_cover.png)
- [25_cover.png](/Users/solmi/Downloads/bokbokbok/public/images/zines/25_cover.png)

### 이미지가 없을 때

이미지가 없으면 기본 이미지로 폴백됩니다.
이 처리는 [src/components/ZineImage.jsx](/Users/solmi/Downloads/bokbokbok/src/components/ZineImage.jsx)에 있습니다.

현재 기본 이미지:

- [bok.png](/Users/solmi/Downloads/bokbokbok/public/images/bok.png)

## 5. 구매 요청(Request for Purchase) 흐름

장바구니는 일반 쇼핑몰 장바구니가 아니라, 거의 즐겨찾기/구매 요청 리스트 개념입니다.

특징:

- 같은 진은 한 번만 담을 수 있음
- 장바구니 페이지에서 리스트 확인 가능
- `Request for Purchase` 버튼으로 요청 폼 제출 가능

프론트에서 요청을 보내는 코드는:

- [src/lib/purchase-requests.js](/Users/solmi/Downloads/bokbokbok/src/lib/purchase-requests.js)

장바구니 UI는:

- [src/pages/CartPage.jsx](/Users/solmi/Downloads/bokbokbok/src/pages/CartPage.jsx)

## 6. 이메일 발송 관련

이메일 발송은 `Google Apps Script`가 담당합니다.

Apps Script 파일:

- [apps-script/purchase-request.gs](/Users/solmi/Downloads/bokbokbok/apps-script/purchase-request.gs)

현재 동작 방식:

1. 사용자가 `Request for Purchase` 폼 제출
2. 프론트가 Apps Script 웹앱 URL로 POST
3. Apps Script가 내용을 구글 스프레드시트에 저장
4. Apps Script가 요청자 이메일로 확인 메일 발송

Apps Script 파일을 수정한 뒤 반영하려면:

1. [apps-script/purchase-request.gs](/Users/solmi/Downloads/bokbokbok/apps-script/purchase-request.gs) 내용을 Google Apps Script 편집기(script.google.com)에 다시 붙여넣고 저장
2. Google Apps Script에서 `Deploy(배포) -> Manage deployments(배포 관리)`로 들어가 연필 아이콘 누르고 버전을 '새 버전' 선택 후 `Deploy(배포)`로 다시 배포
3. 배포 URL이 바뀌었다면 [.env](/Users/solmi/Downloads/bokbokbok/.env)의 `VITE_PURCHASE_REQUEST_ENDPOINT`도 같이 업데이트

중요:

- 메일은 `bok3books@gmail.com`으로 가는 것이 아니라
- 폼에 입력한 **요청자 이메일**로 갑니다

메일 발송 계정은 Apps Script를 배포한 구글 계정입니다.
즉, `bok3books@gmail.com` 계정으로 Apps Script를 만들고 배포해야 발신 계정도 그쪽이 됩니다.

### Apps Script에서 메일이 안 갈 때 확인할 것

1. Apps Script를 `bok3books@gmail.com` 계정으로 열었는지
2. `Deploy -> Manage deployments`에서 새 코드로 다시 배포했는지
3. Apps Script 권한 승인했는지
4. 스프레드시트에 `mail_status`, `mail_error` 값이 어떻게 기록되는지

현재 Apps Script는 시트에 아래 항목도 남깁니다.

- `mail_status`
- `mail_error`

가능한 값:

- `sent`: 메일 발송 성공
- `failed`: 메일 발송 실패
- `skipped`: 이메일 값이 없어서 메일 생략

## 7. Request for Purchase 스프레드시트 보는 법

구매 요청은 Apps Script에 연결된 구글 스프레드시트의
`purchase_requests` 시트에 쌓입니다.

확인 방법:

1. `bok3books@gmail.com` 계정으로 구글 로그인
2. Apps Script 프로젝트 열기
3. `Project Settings`에서 `PURCHASE_REQUEST_SHEET_ID` 확인
4. 해당 ID의 구글 스프레드시트 열기
5. `purchase_requests` 시트 확인

시트 컬럼 의미:

- `created_at`: 요청 시간
- `name`: 요청자 이름
- `note`: 요청자 한마디
- `email`: 요청자 이메일
- `phone`: 요청자 전화번호
- `address`: 요청자 주소
- `extra_contact`: 인스타그램 아이디 등 추가 연락처
- `items`: 요청한 진 목록
- `mail_status`: 메일 발송 상태
- `mail_error`: 메일 실패 시 오류 메시지

## 8. Apps Script URL 설정 위치

프론트는 `.env`에 있는 URL로 Apps Script를 호출합니다.

설정 파일:

- [.env](/Users/solmi/Downloads/bokbokbok/.env)

현재 필요한 환경변수:

```bash
VITE_PURCHASE_REQUEST_ENDPOINT=YOUR_APPS_SCRIPT_WEB_APP_URL
```

중요:

- `.env`를 바꾼 뒤에는 `npm run dev`를 다시 실행해야 합니다.
- 웹앱을 새 배포한 경우 URL이 바뀌었는지 꼭 확인해야 합니다.

## 9. Apps Script 쪽에서 관리해야 할 것

Apps Script 설정 가이드는 별도 문서에도 정리돼 있습니다.

- [APPS_SCRIPT_SETUP.md](/Users/solmi/Downloads/bokbokbok/APPS_SCRIPT_SETUP.md)

- [APPS_SCRIPT_SETUP.md](/Users/solmi/Downloads/bokbokbok/APPS_SCRIPT_SETUP.md)

필수 관리 항목:

1. `PURCHASE_REQUEST_SHEET_ID`가 올바른지
2. Apps Script 웹앱이 `Anyone` 접근 가능인지
3. 새 코드 수정 후 재배포했는지
4. `Executions`에서 오류가 없는지

## 10. 파일 수정 후 반영 체크리스트

진 목록만 바꿨을 때:

1. `public/zines.json` 수정
2. 필요하면 이미지 추가
3. `npm run dev`에서 확인

Apps Script URL 바꿨을 때:

1. `.env` 수정
2. 개발 서버 재시작

Apps Script 코드 바꿨을 때:

1. Apps Script 저장
2. 웹앱 재배포
3. 다시 요청 테스트

## 11. 현재 참고 문서

- 운영/개발 전체 개요: [README.md](/Users/solmi/Downloads/bokbokbok/README.md)
- Apps Script 세팅 절차: [APPS_SCRIPT_SETUP.md](/Users/solmi/Downloads/bokbokbok/APPS_SCRIPT_SETUP.md)
- Apps Script 코드: [apps-script/purchase-request.gs](/Users/solmi/Downloads/bokbokbok/apps-script/purchase-request.gs)
- 진 데이터: [public/zines.json](/Users/solmi/Downloads/bokbokbok/public/zines.json)

## 12. 권장 운영 방식

- 진을 새로 추가할 때는 먼저 `zines.json`부터 수정
- 그다음 표지 이미지 추가
- 구매 요청 테스트를 한 번 보내서 시트 기록과 메일 발송 둘 다 확인

이 문서를 먼저 보고도 해결이 안 되면, 다음 순서로 문제를 찾는 것이 가장 빠릅니다.

1. 브라우저에서 화면 문제인지 확인
2. `.env` URL이 맞는지 확인
3. Apps Script `Executions` 확인
4. 스프레드시트 `mail_status`, `mail_error` 확인
