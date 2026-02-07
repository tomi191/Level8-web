import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { PainPoints } from "@/components/sections/pain-points";
import { Services } from "@/components/sections/services";
import { Pricing } from "@/components/sections/pricing";
import { LeadMagnet } from "@/components/sections/lead-magnet";
import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { ChatWidgetLoader } from "@/components/chatbot/chat-widget-loader";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <PainPoints />
        <Services />
        <Pricing />
        <LeadMagnet />
        <About />
        <Contact />
      </main>
      <Footer />
      <ChatWidgetLoader />
    </>
  );
}
