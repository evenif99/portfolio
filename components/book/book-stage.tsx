import BookCover from "./book-cover";
import BookProgress from "./book-progress";
import BookTabs from "./book-tabs";
import {
  IntroLeftPage,
  IntroRightPage,
  SkillsLeftPage,
  SkillsRightPage,
} from "./book-spread";

// 폴백(모바일, 터치, 낮은 화면, reduced-motion): 스테이지/책/장은 display: contents 로 사라지고
// 같은 DOM 이 트랙(flex-col)의 자식으로 풀려 order 순서대로 세로 한 장 흐름이 된다.
// 책 모드(tablet:slide:): 트랙 500svh 안에 sticky 100svh 스테이지, 스냅 앵커 3개.
const ANCHOR =
  "pointer-events-none block h-0 tablet:slide:absolute tablet:slide:left-0 tablet:slide:h-[100svh] tablet:slide:w-px tablet:slide:snap-start tablet:slide:snap-always";

const LEAF =
  "contents tablet:slide:absolute tablet:slide:inset-y-0 tablet:slide:left-1/2 tablet:slide:block tablet:slide:w-1/2 tablet:slide:origin-left tablet:slide:transform-3d";

const FACE = "block tablet:slide:absolute tablet:slide:inset-0";
const FACE_HIDDEN = `${FACE} tablet:slide:backface-hidden`;

// 종이: 보드보다 사방 14px(rim) 안쪽. 책등 쪽 변은 붙인다. 폴백에서는 일반 블록.
const PAPER_RIGHT =
  "block tablet:slide:absolute tablet:slide:inset-y-rim tablet:slide:right-rim tablet:slide:left-0";
// 뒷면은 면 자체가 rotateY(180deg) 라 로컬 좌표에서 바깥이 왼쪽, 책등이 오른쪽이다.
const PAPER_LEFT =
  "block tablet:slide:absolute tablet:slide:inset-y-rim tablet:slide:left-rim tablet:slide:right-0";

// 가죽 보드(정적 레이어). 폴백에서는 숨긴다.
const BOARD =
  "pointer-events-none hidden tablet:slide:absolute tablet:slide:inset-0 tablet:slide:block";

const SHADE =
  "pointer-events-none hidden tablet:slide:absolute tablet:slide:inset-0 tablet:slide:block tablet:slide:bg-book-bg/40";

export default function BookStage() {
  return (
    <div
      data-book-track
      className="relative flex flex-col tablet:slide:block tablet:slide:h-[500svh]"
    >
      <span aria-hidden="true" className={`${ANCHOR} order-0 tablet:slide:top-0`} />
      <span
        id="book-intro"
        aria-hidden="true"
        className={`${ANCHOR} order-3 tablet:slide:top-[200svh]`}
      />
      <span
        id="book-skills"
        aria-hidden="true"
        className={`${ANCHOR} order-6 tablet:slide:top-[400svh]`}
      />

      <div className="contents tablet:slide:sticky tablet:slide:top-0 tablet:slide:flex tablet:slide:h-[100svh] tablet:slide:items-center tablet:slide:justify-center tablet:slide:overflow-hidden tablet:slide:[perspective:150vw]">
        <div
          data-book-body
          className="contents tablet:slide:relative tablet:slide:block tablet:slide:aspect-[16/10] tablet:slide:w-[min(86vw,140svh)] tablet:slide:shrink-0 tablet:slide:transform-3d tablet:slide:[transform:translateX(-25%)]"
        >
          <BookTabs />

          {/* 표지 장: 앞면 표지, 뒷면 펼침 1 왼쪽 */}
          <div data-book-leaf="cover" className={LEAF}>
            <div
              className={`${FACE_HIDDEN} order-2 tablet:slide:[transform:translateZ(3px)]`}
            >
              <BookCover />
            </div>
            <div
              className={`${FACE_HIDDEN} order-4 tablet:slide:[transform:rotateY(180deg)_translateZ(1px)]`}
            >
              <span
                aria-hidden="true"
                className={`${BOARD} book-board-left tablet:slide:rounded-l-[1.5%]`}
              />
              <div className={PAPER_LEFT}>
                <IntroLeftPage />
                <span aria-hidden="true" data-book-shade className={SHADE} />
              </div>
            </div>
          </div>

          {/* 두 번째 장: 앞면 펼침 1 오른쪽, 뒷면 펼침 2 왼쪽 */}
          <div data-book-leaf="second" className={LEAF}>
            <div
              className={`${FACE_HIDDEN} order-5 tablet:slide:[transform:translateZ(2px)]`}
            >
              <div className={PAPER_RIGHT}>
                <IntroRightPage />
              </div>
            </div>
            <div
              className={`${FACE_HIDDEN} order-7 tablet:slide:[transform:rotateY(180deg)_translateZ(2px)]`}
            >
              <div className={PAPER_LEFT}>
                <SkillsLeftPage />
                <span aria-hidden="true" data-book-shade className={SHADE} />
              </div>
            </div>
          </div>

          {/* 바닥 쪽: 뒤 보드 + 펼침 2 오른쪽. 닫힌 상태에서는 표지(같은 크기, 같은 radius)에 가려진다 */}
          <div className="order-8 block tablet:slide:absolute tablet:slide:inset-y-0 tablet:slide:left-1/2 tablet:slide:w-1/2">
            <span
              aria-hidden="true"
              className={`${BOARD} book-board-right tablet:slide:rounded-r-[1.5%]`}
            />
            <div className={PAPER_RIGHT}>
              <SkillsRightPage />
            </div>
          </div>
        </div>

        <BookProgress />
      </div>
    </div>
  );
}
