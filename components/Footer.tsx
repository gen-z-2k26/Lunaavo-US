import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { StoreSettings } from "@/lib/types";
import { BrandLogo } from "@/components/BrandLogo";
import { pageContainer } from "@/lib/layout";

function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}

export function Footer({ settings }: { settings: StoreSettings }) {
  const columns =
    settings.navigation?.footerColumns?.length > 0
      ? settings.navigation.footerColumns
      : [];
  const phoneHref = settings.contact.phone.replace(/[^\d+]/g, "");
  const year = new Date().getFullYear();
  const legalName = settings.contact.legalName || settings.name;

  const contactRows = [
    settings.contact.address
      ? { icon: MapPin, value: settings.contact.address, href: undefined }
      : null,
    settings.contact.phone
      ? { icon: Phone, value: settings.contact.phone, href: `tel:${phoneHref}` }
      : null,
    settings.contact.email
      ? {
          icon: Mail,
          value: settings.contact.email,
          href: `mailto:${settings.contact.email}`,
        }
      : null,
    settings.contact.openingHours
      ? { icon: Clock, value: settings.contact.openingHours, href: undefined }
      : null,
    settings.footer?.chatLine
      ? { icon: MessageCircle, value: settings.footer.chatLine, href: undefined }
      : null,
  ].filter((row) => row !== null);

  return (
    <footer className="dark mt-auto bg-background text-foreground">
      <div className={pageContainer("py-12 sm:py-16")}>
        <Link href="/" className="inline-flex items-center">
          <BrandLogo heightClass="h-8 sm:h-9" alt={settings.name} />
        </Link>
        {settings.tagline ? (
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            {settings.tagline}
          </p>
        ) : null}

        <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <div key={column.slug || column.title} className="space-y-3">
              <p className="text-sm font-semibold tracking-tight text-foreground">
                {column.title}
              </p>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    {isExternal(link.href) ? (
                      <a
                        href={link.href}
                        className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-sm font-semibold tracking-tight text-foreground">
              {settings.footer?.contactTitle || "Contact Information"}
            </p>
            <p className="mt-3 text-sm font-semibold">{settings.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{legalName}</p>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {contactRows.map((row) => (
                <li key={row.value} className="flex items-start gap-2.5">
                  <row.icon className="mt-0.5 size-4 shrink-0 text-foreground/80" aria-hidden />
                  {row.href ? (
                    <a href={row.href} className="hover:text-foreground">
                      {row.value}
                    </a>
                  ) : (
                    <span>{row.value}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p>
              © {year} {settings.name}. All Rights Reserved.
            </p>
            <p>
              {settings.name} is operated by {legalName}.
            </p>
          </div>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link href="/privacy-policy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <span aria-hidden>·</span>
            <Link href="/terms-of-service" className="hover:text-foreground">
              Terms of Service
            </Link>
            <span aria-hidden>·</span>
            <Link href="/your-privacy-choices" className="hover:text-foreground">
              Your Privacy Choices
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
