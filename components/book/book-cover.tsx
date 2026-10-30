// 서버 컴포넌트. 초기 상태가 최종 상태이며 JS 가 보이거나 숨기지 않는다.
export default function BookCover() {
  return (
    <div className="book-leather flex select-none h-full items-center justify-center px-gutter py-8 text-center tablet:slide:rounded-r-[1.5%]">
      <h1 className="text-2xl font-bold tracking-[0.3em] book-emboss text-book-gold tablet:slide:text-[min(6svh,4.5vw)]">
        개발일지
      </h1>
    </div>
  );
}
