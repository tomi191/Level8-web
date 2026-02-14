import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ServiceWorkerRegister } from "@/components/blog/sw-register";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="alternate" type="application/rss+xml" title="\u041B\u0415\u0412\u0415\u041B 8 \u0411\u043B\u043E\u0433" href="/blog/rss.xml" />
      <ServiceWorkerRegister />
      <Navbar />
      <main className="min-h-screen pt-20 md:pt-24">{children}</main>
      <Footer />
    </>
  );
}
