// 서버 컴포넌트. 초기 상태가 최종 상태이며 JS 가 보이거나 숨기지 않는다.
// 책 모드(tablet:slide:)에서만 표지 너비 기준(cqw/%) 책등 밴드 + 세로 제목이 나온다. 폴백은 가로 제목 띠.
// 표지 비율은 4:5 (책 16:10 의 절반 장). 높이 = 125cqw.
const BAND = "absolute inset-x-[6%] h-[1.9%] book-band";
const GOLD_LINE = "absolute inset-x-[3%] h-[2px] book-gold-line opacity-80";
const TITLE_LINE = "absolute top-[23%] h-[54%] w-px bg-book-gold opacity-60";

export default function BookCover() {
  return (
    <div className="book-leather relative flex select-none h-full items-center justify-center px-gutter py-8 text-center tablet:slide:[border-radius:var(--book-r-cover)] tablet:slide:[container-type:inline-size]">
      <div aria-hidden="true" className="hidden tablet:slide:contents">
        {/* 책등 면 (반투명 오버레이: 가죽 결이 비친다) */}
        <span className="book-spine-face absolute inset-y-0 left-0 w-[14.6%]">
          <span className={`${BAND} top-[13.2%]`} />
          <span className={`${BAND} top-[17.6%]`} />
          <span className={`${BAND} top-[80.3%]`} />
          <span className={`${BAND} top-[84.6%]`} />
          <span className={`${GOLD_LINE} top-[10.5%]`} />
          <span className={`${GOLD_LINE} top-[89.2%]`} />
        </span>
        {/* 힌지 골: 책등 경계(14.6%) 중심, 폭 2.2% */}
        <span className="book-hinge absolute inset-y-0 left-[13.5%] w-[2.2%]" />
        {/* 제목 세로 금선 */}
        <span className={`${TITLE_LINE} left-[41.2%]`} />
        <span className={`${TITLE_LINE} left-[73.5%]`} />
      </div>
      <h1 className="text-2xl font-bold tracking-[0.3em] book-emboss text-book-gold tablet:slide:absolute tablet:slide:top-[23%] tablet:slide:left-[41.2%] tablet:slide:flex tablet:slide:h-[54%] tablet:slide:w-[32.3%] tablet:slide:items-center tablet:slide:justify-center tablet:slide:whitespace-nowrap tablet:slide:pt-[0.14em] tablet:slide:text-[12.5cqw] tablet:slide:leading-none tablet:slide:tracking-[0.14em] tablet:slide:[writing-mode:vertical-rl]">
        개발일지
      </h1>
    </div>
  );
}
