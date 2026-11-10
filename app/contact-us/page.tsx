import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/ContactForm";
import { VerbatimDocument } from "@/components/VerbatimDocument";
import { pageContainer } from "@/lib/layout";
import { discoverBySlug } from "@/lib/discover";

export const revalidate = 3600;

const PAGE = discoverBySlug("contact-us");

export const metadata: Metadata = {
  title: PAGE?.title ?? "Contact Us",
  description: PAGE?.description,
};

export default async function ContactPage() {
  if (!PAGE?.lines?.length) notFound();
  return (
    <>
      <VerbatimDocument lines={PAGE.lines} />
      <section className="border-t border-border bg-muted/50">
        <div className={pageContainer("py-12 sm:py-16")}>
          <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
            Write to us
          </p>
          <h2 className="font-display mt-3 text-3xl text-foreground sm:text-4xl">
            Send a message
          </h2>
          <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <ContactForm />
          </div>
          </div>
        </div>
      </section>
    </>
  );
}
