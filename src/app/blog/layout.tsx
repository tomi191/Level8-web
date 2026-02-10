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
      <ServiceWorkerRegister />
      <Navbar />
      <main className="min-h-screen pt-20 md:pt-24">{children}</main>
      <Footer />
    </>
  );
}
