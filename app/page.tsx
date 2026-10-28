import SiteHeader from "@/components/site-header";
import CustomCursor from "@/components/motion/custom-cursor";
import ThemeTransition from "@/components/motion/theme-transition";
import HeaderTheme from "@/components/motion/header-theme";
import AnchorScroll from "@/components/motion/anchor-scroll";
import Hero from "@/components/sections/hero";
import About from "@/components/sections/about";
import Skills from "@/components/sections/skills";
import Projects from "@/components/sections/projects";
import ContactSection from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <ContactSection />
      </main>
      <ThemeTransition />
      <HeaderTheme />
      <AnchorScroll />
      <CustomCursor />
    </>
  );
}
