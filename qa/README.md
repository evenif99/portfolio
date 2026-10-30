# qa

Playwright 로 화면을 열어 관찰하는 점검 스크립트. 코드를 수정하지 않는다.
결과물은 `qa/out/` (git 무시)에 저장된다.

## 준비

```
npm install
npx playwright install chromium webkit
```

서버는 직접 띄운다. `npm run dev`, 또는 `npm run build` 후 `npm run start`.

## 실행

```
npm run qa -- --url http://localhost:3000/
```

| 옵션 | 기본값 | 설명 |
|---|---|---|
| `--url` | (필수) | 쉼표로 여러 개 |
| `--viewport` | `1440x900,1024x768,390x844` | 390 은 터치/모바일 에뮬레이션 |
| `--browser` | `chromium,webkit` | 둘 다 주면 차이를 비교한다 |
| `--scroll` | `0,0.5,1` | 0~1 스크롤 비율 목록 |
| `--click` | 없음 | 클릭할 셀렉터. 구분자는 `\|\|` |
| `--expect` | 없음 | `셀렉터@속성=값`. 구분자는 `\|\|` |
| `--motion` | `no-preference,reduce` | `reduce` 는 prefers-reduced-motion 에뮬레이션 |
| `--settle` | `800` | 동작 후 대기 ms |

## 예시

```
# 기본 전체 점검
npm run qa -- --url http://localhost:3000/

# 한 뷰포트, chromium 만, 스크롤 비율 지정
npm run qa -- --url http://localhost:3000/ --viewport 390x844 --browser chromium --scroll 0,0.25,0.75,1

# 클릭 후 aria-current 확인
npm run qa -- --url http://localhost:3000/ --click "a[href='#about']||a[href='#projects']" --expect "a[href='#projects']@aria-current=true"
```

## 출력

- 표준 출력: 브라우저/뷰포트/motion 별 표, console·실패 요청·클릭·기대 상태 결과, chromium/webkit 차이
- `qa/out/report.json`: 전체 결과
- `qa/out/*.png`: `브라우저_뷰포트_경로_motion_장면.png`

## 한계

- webkit 은 사파리 엔진 근사다. 실제 iOS 사파리(주소창 높이, 터치 스크롤, 안전 영역)는 대체하지 못한다.
- 스크린샷은 뷰포트 단위다.
