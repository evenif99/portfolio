import type { Metadata } from "next";
import BookStage from "@/components/book/book-stage";
import BookScroll from "@/components/motion/book-scroll";
import AnchorScroll from "@/components/motion/anchor-scroll";

export const metadata: Metadata = {
  robots: { index: false },
};

// HeaderTheme, ThemeTransition 은 main > section 기반이라 이 라우트에 마운트하지 않는다.
export default function BookSpikePage() {
  return (
    <>
      <main className="bg-book-bg">
        <BookStage />
      </main>
      <BookScroll />
      <AnchorScroll />
    </>
  );
}
