import Link from "next/link";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { discoverBySlug } from "@/lib/discover";
import { pageContainer, sectionStackClass, sectionYClass } from "@/lib/layout";
import { cn } from "@/lib/utils";

function questionsFromLines(lines: string[]) {
  const items: { question: string; answer: string }[] = [];
  let current: { question: string; answer: string } | null = null;
  for (const line of lines) {
    const match = line.match(/^Q\d+\.\s+(.*)/);
    if (match) {
      if (current) items.push(current);
      current = { question: match[1], answer: "" };
      continue;
    }
    if (current && !current.answer && line.trim() && !line.startsWith("* ")) {
      current.answer = line;
    }
  }
  if (current) items.push(current);
  return items.slice(0, 3);
}

export function FaqPreviewSection() {
  const page = discoverBySlug("faqs");
  const questions = page?.lines?.length
    ? questionsFromLines(page.lines)
    : page?.sections
        .flatMap((section) => section.blocks)
        .filter((block) => block.type === "faq")
        .slice(0, 3)
        .map((block) =>
          block.type === "faq"
            ? { question: block.question, answer: block.answer }
            : null,
        )
        .filter((block) => block !== null) ?? [];

  if (!questions.length) return null;

  return (
    <section
      aria-labelledby="faq-preview-heading"
      className={cn("border-b border-border", sectionYClass)}
    >
      <div className={pageContainer(sectionStackClass)}>
        <SectionHeader
          eyebrow="FAQs"
          title="A few answers before you order"
          subtitle="Shipping, returns, and product questions are collected in the help center."
          titleId="faq-preview-heading"
          action={
            <Link
              href="/faqs"
              className="text-sm font-medium text-accent underline-offset-4 hover:underline"
            >
              All FAQs
            </Link>
          }
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {questions.map((block) => (
            <article key={block.question} className="surface-card h-full p-6">
              <h3 className="text-lg tracking-tight">{block.question}</h3>
              <p className="mt-3 line-clamp-5 text-sm leading-relaxed text-muted-foreground">
                {block.answer}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
