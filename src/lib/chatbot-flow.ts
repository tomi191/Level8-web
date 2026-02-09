import type { ChatStep } from "@/types/chatbot";

export const CHATBOT_FLOW: Record<string, ChatStep> = {
  welcome: {
    id: "welcome",
    messages: [
      "Здравейте! {icon:hand} Аз съм Архитектът на Level 8.",
      "Мога да ви помогна да разберете кое решение е най-подходящо за вашия бизнес.",
      "Какво ви интересува най-много? {icon:down}",
    ],
    options: [
      { id: "opt-commerce", label: "{icon:cart} Онлайн магазин", nextStep: "branch_commerce" },
      { id: "opt-automate", label: "{icon:zap} Автоматизация", nextStep: "branch_automate" },
      { id: "opt-ai", label: "{icon:bot} AI Чатбот", nextStep: "branch_ai" },
      { id: "opt-loyalty", label: "{icon:gem} Програма за лоялност", nextStep: "branch_loyalty" },
    ],
  },
  branch_commerce: {
    id: "branch_commerce",
    messages: [
      "Чудесен избор! {icon:cart}",
      "{icon:rocket} Нашите онлайн магазини са бързи, красиви и оптимизирани за конверсии. Включваме интеграция с платежни системи, куриери и SEO — всичко наготово.",
      "{icon:coins} Цената започва от 1 290 € еднократно, с 3 месеца безплатна поддръжка.",
      "{icon:mail} Искате ли да обсъдим вашия проект? Оставете данните си и ще се свържем до 24ч.",
    ],
    options: [
      { id: "commerce-yes", label: "{icon:check} Да, искам повече информация", nextStep: "capture_contact" },
      { id: "commerce-back", label: "{icon:refresh} Виж друга услуга", nextStep: "welcome" },
    ],
  },
  branch_automate: {
    id: "branch_automate",
    messages: [
      "Умен ход! {icon:zap}",
      "{icon:wrench} Автоматизацията спестява часове ръчна работа всеки ден. Свързваме CRM, фактуриране, инвентар и комуникация в един плавен workflow.",
      "{icon:chart} Според нашите клиенти, спестяват средно 15-20 часа на седмица.",
      "{icon:mail} Искате ли безплатна консултация? Оставете данните си.",
    ],
    options: [
      { id: "automate-yes", label: "{icon:check} Да, искам консултация", nextStep: "capture_contact" },
      { id: "automate-back", label: "{icon:refresh} Виж друга услуга", nextStep: "welcome" },
    ],
  },
  branch_ai: {
    id: "branch_ai",
    messages: [
      "Точно като мен! {icon:bot}",
      "{icon:brain} Нашите AI чатботове работят 24/7, обучени с вашите данни. Отговарят на клиентски въпроси, квалифицират потенциални клиенти и дори записват срещи.",
      "{icon:coins} Цената е от 249 €/месец, с пълна настройка и месечни отчети.",
      "{icon:clapperboard} Искате ли демонстрация? Оставете данните си и ще ви покажем на живо.",
    ],
    options: [
      { id: "ai-yes", label: "{icon:check} Да, искам демо", nextStep: "capture_contact" },
      { id: "ai-back", label: "{icon:refresh} Виж друга услуга", nextStep: "welcome" },
    ],
  },
  branch_loyalty: {
    id: "branch_loyalty",
    messages: [
      "Отличен избор! {icon:gem}",
      "{icon:trophy} Програмата за лоялност превръща еднократните клиенти в постоянни. Система за точки, персонални оферти, push известия — всичко в брандиран интерфейс.",
      "{icon:coins} Цената е от 199 €/месец, включително аналитика и поддръжка.",
      "{icon:mail} Искате ли да обсъдим как да задържите повече клиенти? Оставете данните си.",
    ],
    options: [
      { id: "loyalty-yes", label: "{icon:check} Да, свържете се с мен", nextStep: "capture_contact" },
      { id: "loyalty-back", label: "{icon:refresh} Виж друга услуга", nextStep: "welcome" },
    ],
  },
  capture_contact: {
    id: "capture_contact",
    messages: [
      "Супер! {icon:target} Моля, попълнете вашите данни и ще се свържем с вас много скоро.",
    ],
    isContactForm: true,
  },
  thank_you: {
    id: "thank_you",
    messages: [
      "Благодарим ви! {icon:sparkles}",
      "{icon:clock} Нашият екип ще се свърже с вас до 24 часа.",
      "{icon:globe} Междувременно, разгледайте сайта ни за повече информация.",
    ],
    isThankYou: true,
  },
};
