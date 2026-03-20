import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { PainPoints } from "@/components/sections/pain-points";
import { Services } from "@/components/sections/services";
import { Portfolio } from "@/components/sections/portfolio";
import { Pricing } from "@/components/sections/pricing";
import { TechStack } from "@/components/sections/tech-stack";
import { LeadMagnet } from "@/components/sections/lead-magnet";
import { Testimonials } from "@/components/sections/testimonials";
import { About } from "@/components/sections/about";
import { FAQ } from "@/components/sections/faq";
import { Contact } from "@/components/sections/contact";
import { InstagramFeed } from "@/components/sections/instagram-feed";
import { ChatWidgetLoader } from "@/components/chatbot/chat-widget-loader";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
import { CircuitDivider } from "@/components/animations/circuit-divider";
import { A11Y } from "@/lib/constants";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Колко време отнема изграждането на проект?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Лендинг страница — 1-2 седмици. Онлайн магазин — 3-5 седмици. AI чатбот — 1-2 седмици за настройка и обучение. Всеки проект е различен, затова правим безплатна консултация преди да дадем точен срок.",
      },
    },
    {
      "@type": "Question",
      name: "Какво се случва, ако не съм доволен от резултата?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Работим с неограничени ревизии до пълното ви удовлетворение. Вашият проект не се пуска live, докато не сте 100% доволни. Прозрачната комуникация е приоритет — получавате preview на всеки етап.",
      },
    },
    {
      "@type": "Question",
      name: "Кой притежава кода и дизайна след проекта?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Вие. След финално плащане, целият код, дизайн и съдържание са ваша собственост. Получавате пълен достъп до source code и хостинг акаунт.",
      },
    },
    {
      "@type": "Question",
      name: "Какво включва поддръжката?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Безплатната поддръжка включва бъг фиксове, security updates и малки корекции. За STARTUP — 1 месец, за COMMERCE — 3 месеца. След това предлагаме месечен план за поддръжка при нужда.",
      },
    },
    {
      "@type": "Question",
      name: "Работите ли с клиенти извън България?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Да! Работим с клиенти от цял свят. Комуникацията е онлайн — през Zoom, Slack или email. Фактурираме в EUR и приемаме банков превод и карта.",
      },
    },
    {
      "@type": "Question",
      name: "Мога ли да надградя пакета си по-късно?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Разбира се. Всички наши решения са модулни — можете да започнете с лендинг и после да добавите онлайн магазин, AI чатбот или програма за лоялност. Надграждането е безпроблемно.",
      },
    },
    {
      "@type": "Question",
      name: "Имам ли нужда от технически познания?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Не. Ние поемаме цялата техническа част — от хостинг и домейн до настройка и пускане. Получавате обучение за админ панела и сме на линия за всякакви въпроси.",
      },
    },
    {
      "@type": "Question",
      name: "Как работи безплатната консултация?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Свържете се с нас и ще уговорим 30-минутен разговор. Ще обсъдим вашите нужди, бюджет и срокове, и ще предложим конкретно решение. Без ангажимент.",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
        <Testimonials />
        <CircuitDivider />
        <InstagramFeed />
        <CircuitDivider />
        <Pricing />
        <CircuitDivider />
        <TechStack />
        <CircuitDivider />
        <About />
        <CircuitDivider />
        <LeadMagnet />
        <CircuitDivider />
        <FAQ />
        <CircuitDivider />
        <Contact />
      </main>
      <Footer />
      <ScrollToTop />
      <ChatWidgetLoader />
    </>
  );
}
