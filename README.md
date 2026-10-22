# 한율 웹사이트

`index.html`을 열면 메인 페이지에서 시작합니다. 별도 설치나 빌드 없이 실행하는 HTML·CSS·JavaScript 사이트입니다.

## 페이지

| 파일 | 화면 |
| --- | --- |
| `index.html` | 메인 |
| `shop.html` | 쇼핑 |
| `brand.html` | 브랜드 스토리 |
| `ingredients.html` | 한율의 원료 |
| `mypage.html` | 마이페이지 |

## 폴더

- `css/`: 스타일. `main.css`는 공통 기반과 메인 화면, `shared-pages.css`는 서브페이지 공통과 브랜드 화면, `typography.css`는 쇼핑·마이페이지 공통 글자 크기입니다.
- `js/`: 페이지 동작과 데이터. `main.js`는 메인 화면, `shared-pages.js`는 서브페이지 메뉴와 마이페이지 동작입니다.
- `assets/shared/`: 로고, 상단 아이콘, 푸터 등 공통 이미지.
- `assets/home/`: 메인 화면 이미지.
- `assets/videos/`: 영상.
- `assets/shop/`, `assets/brand/`, `assets/ingredients/`, `assets/mypage/`: 각 화면에서 사용하는 이미지.

쇼핑 데이터는 `js/shop-data.js`, 원료 데이터는 `js/ingredients-data.js`에서 수정합니다. 마이페이지는 디자인 예시 데이터를 표시합니다.

HTML 페이지는 최상위 폴더에 유지해 기존 페이지 주소를 보존합니다. CSS의 이미지 경로는 `../assets/`, HTML과 JavaScript의 이미지 경로는 `./assets/`를 사용합니다.
