import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FOOTER } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Политика за поверителност | ЛЕВЕЛ 8",
  description:
    "Политика за поверителност и защита на личните данни на ЛЕВЕЛ 8 ЕООД. Научете как събираме, обработваме и защитаваме вашите лични данни съгласно GDPR.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0430 \u0437\u0430 \u043F\u043E\u0432\u0435\u0440\u0438\u0442\u0435\u043B\u043D\u043E\u0441\u0442 | \u041B\u0415\u0412\u0415\u041B 8",
    description:
      "\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0430 \u0437\u0430 \u043F\u043E\u0432\u0435\u0440\u0438\u0442\u0435\u043B\u043D\u043E\u0441\u0442 \u0438 \u0437\u0430\u0449\u0438\u0442\u0430 \u043D\u0430 \u043B\u0438\u0447\u043D\u0438\u0442\u0435 \u0434\u0430\u043D\u043D\u0438 \u043D\u0430 \u041B\u0415\u0412\u0415\u041B 8 \u0415\u041E\u041E\u0414.",
    url: "/privacy",
    type: "website",
    locale: "bg_BG",
    siteName: "\u041B\u0415\u0412\u0415\u041B 8",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "\u041B\u0415\u0412\u0415\u041B 8" }],
  },
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-8">
            Политика за поверителност
          </h1>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            {/* 1. Администратор */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                1. Администратор на лични данни
              </h2>
              <p>
                Администратор на личните данни е <strong className="text-foreground">ЛЕВЕЛ 8 ЕООД</strong>,
                регистрирано в Търговски регистър на Република България, със седалище и адрес на
                управление: България.
              </p>
              <p className="mt-2">
                Имейл за контакт: <a href={`mailto:${FOOTER.email}`} className="text-neon underline underline-offset-2 hover:text-neon/80">{FOOTER.email}</a>
              </p>
            </section>

            {/* 2. Какви данни събираме */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                2. Какви данни събираме
              </h2>
              <p>Чрез формите за контакт и чатбота на нашия уебсайт може да събираме следните лични данни:</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Име</li>
                <li>Телефонен номер</li>
                <li>Имейл адрес</li>
                <li>Уебсайт адрес</li>
                <li>Съдържание на съобщението (описание на проект)</li>
              </ul>
            </section>

            {/* 3. Цел на обработката */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                3. Цел на обработката
              </h2>
              <p>Личните данни се обработват за следните цели:</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Отговор на запитвания, изпратени чрез формата за контакт или чатбота</li>
                <li>Предоставяне на поискани услуги и изготвяне на оферти</li>
                <li>Изпращане на безплатен дигитален одит (при заявка)</li>
                <li>Комуникация във връзка с текущи проекти</li>
              </ul>
            </section>

            {/* 4. Правно основание */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                4. Правно основание
              </h2>
              <p>
                Обработката на личните данни се основава на <strong className="text-foreground">изричното
                съгласие</strong> на субекта на данните, съгласно чл.&nbsp;6, параграф&nbsp;1,
                буква&nbsp;(а) от Регламент (ЕС)&nbsp;2016/679 (GDPR). Съгласието се дава чрез
                отбелязване на съответното поле в контактните форми.
              </p>
              <p className="mt-2">
                Вие имате право да оттеглите съгласието си по всяко време, без това да засяга
                законосъобразността на обработката, извършена преди оттеглянето.
              </p>
            </section>

            {/* 5. Срок на съхранение */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                5. Срок на съхранение
              </h2>
              <p>
                Личните данни се съхраняват за срок не по-дълъг от необходимото за постигане на
                целите, за които са събрани. При завършване на проект или оттегляне на съгласие
                данните се изтриват в рамките на 30 дни, освен ако нормативен акт не изисква
                по-дълъг срок на съхранение.
              </p>
            </section>

            {/* 6. Права на субекта */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                6. Вашите права
              </h2>
              <p>Съгласно GDPR, Вие имате следните права:</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li><strong className="text-foreground">Право на достъп</strong> — да получите информация дали и какви Ваши данни обработваме</li>
                <li><strong className="text-foreground">Право на коригиране</strong> — да поискате коригиране на неточни данни</li>
                <li><strong className="text-foreground">Право на изтриване</strong> (&bdquo;правото да бъдеш забравен&rdquo;) — да поискате изтриване на данните си</li>
                <li><strong className="text-foreground">Право на ограничаване</strong> — да поискате ограничаване на обработката</li>
                <li><strong className="text-foreground">Право на преносимост</strong> — да получите данните си в структуриран, машинночитаем формат</li>
                <li><strong className="text-foreground">Право на възражение</strong> — да възразите срещу обработката</li>
              </ul>
              <p className="mt-2">
                За упражняване на правата си, моля свържете се с нас на{" "}
                <a href={`mailto:${FOOTER.email}`} className="text-neon underline underline-offset-2 hover:text-neon/80">{FOOTER.email}</a>.
              </p>
              <p className="mt-2">
                Имате също право да подадете жалба до Комисия за защита на личните данни (КЗЛД)
                на адрес: бул. &bdquo;Проф. Цветан Лазаров&rdquo; №&nbsp;2, София 1592.
              </p>
            </section>

            {/* 7. Бисквитки */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                7. Бисквитки (Cookies)
              </h2>
              <p>Нашият уебсайт използва следните видове бисквитки:</p>
              <ul className="mt-2 list-disc list-inside space-y-2">
                <li>
                  <strong className="text-foreground">Необходими бисквитки</strong> &mdash; за
                  коректното функциониране на сайта (напр. Supabase автентикация за
                  административния панел). Те не изискват съгласие.
                </li>
                <li>
                  <strong className="text-foreground">Аналитични бисквитки</strong> &mdash; Google
                  Analytics (GA4) за анализ на посещаемостта. Зареждат се само след вашето изрично
                  съгласие.
                </li>
                <li>
                  <strong className="text-foreground">Маркетингови бисквитки</strong> &mdash;
                  Facebook Pixel за измерване на ефективността на рекламни кампании. Зареждат се
                  само след вашето изрично съгласие.
                </li>
              </ul>
              <p className="mt-3">
                При първото си посещение ще видите банер за бисквитки, чрез който можете да приемете
                или откажете аналитичните и маркетинговите бисквитки. Можете да промените избора си
                по всяко време чрез линка &bdquo;Бисквитки&rdquo; в долната част на сайта.
              </p>
            </section>

            {/* 8. Промени */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                8. Промени в политиката
              </h2>
              <p>
                Запазваме правото да актуализираме настоящата политика за поверителност. При
                съществени промени ще публикуваме актуализираната версия на тази страница с нова
                дата на влизане в сила.
              </p>
            </section>

            {/* 9. Контакт */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                9. Контакт
              </h2>
              <p>
                Ако имате въпроси относно обработката на личните Ви данни, моля свържете се с нас:
              </p>
              <ul className="mt-2 space-y-1">
                <li>Имейл: <a href={`mailto:${FOOTER.email}`} className="text-neon underline underline-offset-2 hover:text-neon/80">{FOOTER.email}</a></li>
                <li>Телефон: {FOOTER.phone}</li>
              </ul>
            </section>

            <p className="text-sm text-muted-foreground/60 pt-4 border-t border-border">
              Последна актуализация: февруари 2026 г.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
