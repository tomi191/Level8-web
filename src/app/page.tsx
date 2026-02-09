import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { PainPoints } from "@/components/sections/pain-points";
import { Services } from "@/components/sections/services";
import { Portfolio } from "@/components/sections/portfolio";
import { Pricing } from "@/components/sections/pricing";
import { TechStack } from "@/components/sections/tech-stack";
import { LeadMagnet } from "@/components/sections/lead-magnet";
import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { ChatWidgetLoader } from "@/components/chatbot/chat-widget-loader";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
import { CircuitDivider } from "@/components/animations/circuit-divider";
import { A11Y } from "@/lib/constants";

export default function Home() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-neon focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:font-semibold"
      >
        {A11Y.skipNav}
      </a>
      <Navbar />
      <main id="main-content">
        <Hero />
        <CircuitDivider />
        <PainPoints />
        <CircuitDivider />
        <Services />
        <CircuitDivider />
        <Portfolio />
        <CircuitDivider />
        <Pricing />
        <CircuitDivider />
        <TechStack />
        <CircuitDivider />
        <LeadMagnet />
        <CircuitDivider />
        <About />
        <CircuitDivider />
        <Contact />
      </main>
      <Footer />
      <ScrollToTop />
      <ChatWidgetLoader />
    </>
  );
}
