import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { pageContainer, sectionStackClass, sectionYClass } from "@/lib/layout";
import { cn } from "@/lib/utils";

const needs = [
  {
    title: "Kitchen appliances",
    text: "Blenders, toasters, mixers, and other countertop equipment, with specifications you can review before you buy.",
    image: "/brand/lunaavo-appliances.jpg",
    alt: "Blender, toaster, mixer, and kettle on a kitchen counter",
    imageClass: "object-center",
    tile: "feature" as const,
  },
  {
    title: "Cooking and food preparation",
    text: "Boards, pans, and the everyday tools that turn ingredients into a meal.",
    image: "/brand/lunaavo-cooking.jpg",
    alt: "Cutting board with herbs, tomatoes, and a skillet",
    imageClass: "object-center",
    tile: "wide" as const,
  },
  {
    title: "Coffee and beverage",
    text: "Equipment for coffee, espresso, tea, and other drinks, in different sizes and features.",
    image: "/brand/lunaavo-coffee.jpg",
    alt: "Pour-over coffee, kettle, and ceramic cups",
    imageClass: "object-center",
    tile: "compact" as const,
  },
  {
    title: "Specialized equipment",
    text: "Tools for particular recipes and techniques, gathered in one kitchen and dining shop.",
    image: "/brand/lunaavo-specialty.jpg",
    alt: "Pasta machine, slicer, and small plates on a counter",
    imageClass: "object-center",
    tile: "compact" as const,
  },
];

const tileClass = {
  feature: "min-h-[28rem] sm:col-span-2 lg:col-span-2 lg:row-span-2 lg:min-h-0",
  wide: "min-h-72 sm:col-span-2 lg:col-span-2 lg:min-h-0",
  compact: "min-h-64 lg:min-h-0",
};

const titleClass = {
  feature: "max-w-md text-3xl sm:text-4xl lg:text-[2.85rem]",
  wide: "text-2xl sm:text-3xl",
  compact: "text-2xl leading-tight",
};

const copyClass = {
  feature: "mt-3 max-w-md text-sm leading-relaxed text-white/85 sm:text-base",
  wide: "mt-2 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base",
  compact: "mt-2 line-clamp-2 text-sm leading-snug text-white/80",
};

export function NeedsSection() {
  return (
    <section
      id="categories"
      aria-labelledby="needs-heading"
      className={cn("border-b border-border", sectionYClass)}
    >
      <div className={pageContainer(sectionStackClass)}>
        <SectionHeader
          eyebrow="Collections"
          title="Shop the kitchen and dining collection"
          subtitle="Appliances, cookware, coffee, and tools for a particular recipe."
          titleId="needs-heading"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:h-[42rem] lg:grid-cols-4 lg:grid-rows-2">
          {needs.map((item) => (
            <Link
              key={item.title}
              href="/products"
              className={cn(
                "dark group relative isolate flex overflow-hidden rounded-2xl bg-background text-foreground",
                tileClass[item.tile],
              )}
            >
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes={
                  item.tile === "compact"
                    ? "(min-width: 1024px) 22vw, (min-width: 640px) 50vw, 100vw"
                    : "(min-width: 1024px) 46vw, 100vw"
                }
                className={cn(
                  "object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]",
                  item.imageClass,
                )}
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/28 to-transparent"
              />
              <div
                className={cn(
                  "relative mt-auto flex w-full flex-col",
                  item.tile === "feature" ? "p-6 sm:p-8" : "p-5 sm:p-6",
                )}
              >
                <h3 className={cn("font-display text-balance", titleClass[item.tile])}>
                  {item.title}
                </h3>
                <p className={copyClass[item.tile]}>{item.text}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                  Shop collection
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
