import Link from "next/link";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { Reveal } from "@/components/sections/Reveal";
import { buttonVariants } from "@/components/ui/button";
import { pageContainer, sectionStackClass, sectionYClass } from "@/lib/layout";
import { cn } from "@/lib/utils";

const pillars = [
  {
    title: "Clear product information",
    text: "Listings aim to show the features and specifications you need before you compare kitchen equipment.",
  },
  {
    title: "Transparent pricing",
    text: "Prices are in U.S. dollars. Shipping and the order total are shown before you pay.",
  },
  {
    title: "Shipping you can review",
    text: "Shipping charges and delivery timing are explained in our shipping policy and shown at checkout.",
  },
  {
    title: "Returns you can look up",
    text: "Eligibility, timing, and any fees are described in the returns policy. Contact us before sending an item back.",
  },
];

export function CommitmentSection() {
  return (
    <section
      aria-labelledby="commitment-heading"
      className={cn("border-b border-border bg-muted/40", sectionYClass)}
    >
      <div className={pageContainer(sectionStackClass)}>
        <SectionHeader
          eyebrow="Our commitment"
          title="Clear information, then support when you need it"
          subtitle="The same standards apply whether the order is a coffee maker or a larger kitchen appliance."
          titleId="commitment-heading"
          action={
            <Link
              href="/our-commitment"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Read the commitment
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {pillars.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.05}>
              <div className="surface-card h-full space-y-2 p-6">
                <h3 className="text-lg tracking-tight">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
