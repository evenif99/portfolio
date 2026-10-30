// 책 모드(tablet:slide:)에서만 보인다. 막대는 BookScroll 이 scaleX 로 갱신한다.
export default function BookProgress() {
  return (
    <div
      role="progressbar"
      aria-label="읽은 진행도"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      data-book-progress
      className="hidden tablet:slide:absolute tablet:slide:right-[5vw] tablet:slide:bottom-[3svh] tablet:slide:left-[5vw] tablet:slide:block tablet:slide:h-1.5 tablet:slide:rounded-full tablet:slide:bg-book-paper/15"
    >
      <div
        data-book-bar
        className="h-full origin-left rounded-full bg-book-green tablet:slide:[transform:scaleX(0)]"
      />
    </div>
  );
}
