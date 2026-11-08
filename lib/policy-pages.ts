import { CONTENT_PAGES } from "@/lib/site-urls";
import type { FaqGroup } from "@/lib/types";

export type PolicySection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type PolicyPageDef = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  groupTitles: string[];
  paragraphs?: string[];
  designed?: boolean;
  sections?: PolicySection[];
};

export const POLICY_PAGES: PolicyPageDef[] = [
  {
    slug: "shipping-policy",
    title: "Shipping & Delivery",
    description:
      "At Lunaavo, we understand how important it is to receive your kitchen appliances and dining essentials safely and within the expected delivery timeframe.",
    intro:
      "This Shipping & Delivery Policy explains how orders are processed, where we deliver, how shipping charges are calculated, and what to do if you experience a delivery issue.",
    groupTitles: ["Shipping and delivery"],
  },
  {
    slug: "return-and-refund-policy",
    title: "Returns & Refunds",
    description:
      "Our Returns & Refunds Policy explains how to request a return, which products may be eligible, how refunds are processed, and what to do if you receive a damaged, defective, or incorrect item.",
    intro:
      "At Lunaavo, customer satisfaction is important to us. Review this policy before placing an order.",
    groupTitles: ["Returns and exchanges", "Refunds"],
  },
  {
    slug: "cancellation-policy",
    title: "Order Cancellation",
    description:
      "This Order Cancellation Policy explains how to request a cancellation, when an order may be canceled, how refunds are handled, and what happens if your order has already been shipped.",
    intro:
      "At Lunaavo, we understand that plans can change. Contact us as soon as you need to cancel or change an order.",
    groupTitles: ["Placing and managing orders"],
  },
  {
    slug: "payment-policy",
    title: "Payment Methods",
    description:
      "This Payment Policy explains how payments are handled, which payment methods may be available, how billing information is processed, and what to do if you encounter a payment-related issue.",
    intro:
      "All prices on Lunaavo are displayed in United States Dollars (USD) unless otherwise indicated. The methods shown at checkout are the options available for your purchase.",
    groupTitles: ["Payments and checkout"],
  },
  {
    slug: "buy-now-pay-later",
    title: "Buy Now, Pay Later",
    description:
      "Installment or deferred-payment services are available only when expressly displayed and offered through checkout.",
    intro:
      "Any such payment method is subject to its provider's eligibility criteria, terms, and approval requirements. Lunaavo does not guarantee a specific payment method unless it is shown during checkout.",
    groupTitles: ["Buy Now, Pay Later (BNPL)"],
  },
  {
    slug: "warranty",
    title: "Warranty & Product Support",
    description:
      "This page explains how product warranties work, how to request assistance, and what to do if your purchase develops a problem.",
    intro:
      "Warranty coverage and available remedies depend on the product, its applicable warranty terms, and relevant consumer protection laws.",
    groupTitles: ["Warranty and product support"],
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    description:
      "How Lunaavo collects, uses, and shares information when you shop with us.",
    intro:
      "This policy explains how Lunaavo, operated by San Rafael Luggage Center, Inc, handles information when you browse the store, place an order, or contact support.",
    groupTitles: [],
    designed: true,
    sections: [
      {
        title: "Who we are",
        paragraphs: [
          "Lunaavo is an online store operated by San Rafael Luggage Center, Inc. Our business correspondence address is 2221 Shattuck Ave., Berkeley, CA 94704, United States. That address is not a retail showroom or an authorized return location.",
          "Questions about this policy can be sent to info@lunaavo.us or +1 (510) 345-2632. Live chat is available 24/7. Phone support hours are Monday-Friday, 9:00 AM-5:00 PM Pacific Time.",
        ],
      },
      {
        title: "Information we collect",
        paragraphs: [
          "We collect the details needed to complete a purchase and to answer your questions. That typically includes your name, email address, shipping and billing details, phone number, order contents, and messages you send to our team.",
        ],
        bullets: [
          "Account-free checkout details you enter during an order.",
          "Order history, tracking references, and support tickets tied to your purchase.",
          "Technical data such as browser type, device, and pages visited, used to keep the store working.",
          "Payment status from our processors. We do not store full card numbers on this website.",
        ],
      },
      {
        title: "How we use information",
        paragraphs: [
          "We use customer information for store operations, not for unrelated marketing lists created from your order.",
        ],
        bullets: [
          "Processing orders, arranging delivery, and sending confirmations or tracking updates.",
          "Providing customer assistance by email, phone, or live chat.",
          "Supporting secure checkout and preventing fraud or abuse.",
          "Maintaining website functionality, including the shopping cart.",
          "Meeting applicable legal, tax, and accounting obligations.",
        ],
      },
      {
        title: "Payments and processors",
        paragraphs: [
          "Checkout payments are handled by participating third-party providers such as Stripe and, where shown, Buy Now Pay Later services including Afterpay or Affirm. Those providers process payment credentials under their own terms and privacy notices.",
          "Prices and checkout totals are displayed in United States Dollars (USD).",
        ],
      },
      {
        title: "Sharing",
        paragraphs: [
          "We share information with service partners who help us fulfill your order, such as shipping carriers, payment processors, and the WordPress / WooCommerce platform that powers catalog and checkout data. We do not sell your personal information.",
        ],
      },
      {
        title: "Retention and security",
        paragraphs: [
          "Order records are kept for as long as needed to fulfill the purchase, handle returns, and meet legal record-keeping requirements. We use reasonable administrative and technical measures to protect the store, including encrypted checkout through our payment provider.",
        ],
      },
      {
        title: "Your privacy choices",
        paragraphs: [
          "You may contact info@lunaavo.us with a privacy-related request, including access, correction, or deletion where applicable law provides those rights. We will review the request and respond according to the laws that apply to your situation.",
          "California residents and other US shoppers can also visit the Your Privacy Choices page on this site.",
        ],
      },
    ],
  },
  {
    slug: "terms-of-service",
    title: "Terms of Service",
    description:
      "The purchasing, shipping, return, and payment terms that apply when you shop at Lunaavo.",
    intro:
      "By browsing this store or placing an order you agree to the terms published here, together with our shipping, return, payment, and privacy pages.",
    groupTitles: [],
    designed: true,
    sections: [
      {
        title: "The store",
        paragraphs: [
          "Lunaavo is an online retail store for kitchen appliances and dining essentials, operated by San Rafael Luggage Center, Inc in Berkeley, California. The business address is for identification and correspondence. Contact support before visiting or mailing a return.",
        ],
      },
      {
        title: "Orders",
        paragraphs: [
          "An order is an offer to buy the products listed in your cart at the prices shown at checkout. We may decline or cancel an order if an item is unavailable, a payment cannot be completed, or the order appears fraudulent or incomplete.",
          "You may request a cancellation. Whether it can be completed depends on fulfillment status and the Order Cancellation Policy. Once an order has shipped, the return policy may apply instead.",
        ],
      },
      {
        title: "Pricing and payment",
        paragraphs: [
          "Prices are shown in United States Dollars (USD). Applicable tax and the final order total appear at checkout. The payment methods displayed for your purchase are the options available at that time.",
          "Installment or deferred-payment services are available only when they are displayed at checkout. Approval, installments, interest, and fees are set by the payment provider.",
        ],
      },
      {
        title: "Shipping",
        paragraphs: [
          "Shipping charges, processing times, and delivery estimates are disclosed during checkout and in the Shipping & Delivery Policy.",
          "Delivery estimates can change because of carrier conditions, holidays, weather, or other events outside our control.",
        ],
      },
      {
        title: "Returns and refunds",
        paragraphs: [
          "Return eligibility, timing, shipping responsibility, and any restocking fee are described in the Returns & Refunds Policy.",
          "Do not send products to the Berkeley business address unless customer support specifically authorizes that destination.",
        ],
      },
      {
        title: "Product information and warranties",
        paragraphs: [
          "Please review product descriptions, specifications, and compatibility notes before you buy. Warranty coverage varies by product and manufacturer. We do not promise a blanket warranty period on every item.",
          "If a product arrives damaged, defective, or incorrect, contact us so we can review prepaid return shipping and the options available under our return policy.",
        ],
      },
      {
        title: "Limitation of liability",
        paragraphs: [
          "To the fullest extent permitted by law, San Rafael Luggage Center, Inc and Lunaavo are not liable for indirect, incidental, or consequential damages arising from your use of the site or from products purchased through it. Nothing in these terms limits rights you have under applicable consumer law.",
        ],
      },
      {
        title: "Contact",
        paragraphs: [
          "Email info@lunaavo.us, call +1 (510) 345-2632, or use live chat, available 24/7. Business hours are Monday-Friday, 9:00 AM-5:00 PM Pacific Time.",
        ],
      },
    ],
  },
  {
    slug: "cookie-policy",
    title: "Cookie Policy",
    description: "How cookies are used on the Lunaavo storefront.",
    intro:
      "Essential cookies may support shopping carts, checkout, security, and other website functions. Additional cookies depend on the services enabled.",
    groupTitles: ["Accounts, privacy, and security"],
  },
  {
    slug: "legal-notice",
    title: "Legal Notice",
    description: "Business identity and correspondence address for Lunaavo.",
    intro:
      "Lunaavo is operated by San Rafael Luggage Center, Inc.",
    groupTitles: ["General questions"],
    paragraphs: [
      "Business address: 2221 Shattuck Ave., Berkeley, CA 94704, United States. This address is for business correspondence and is not a retail showroom or an authorized return location.",
      "Website: https://lunaavo.us. Email: info@lunaavo.us. Phone: +1 (510) 345-2632.",
    ],
  },
  {
    slug: "accessibility-statement",
    title: "Accessibility Statement",
    description:
      "How we aim to keep the Lunaavo store easier to navigate, and how to ask for help.",
    intro:
      "We want our website and shopping information to be easier for customers to navigate and understand. This statement describes that aim and how to reach us if a page, listing, or checkout step is difficult to use.",
    groupTitles: [],
    designed: true,
    sections: [
      {
        title: "Our commitment",
        paragraphs: [
          "Lunaavo, operated by San Rafael Luggage Center, Inc, is working to keep product information, policies, and checkout steps clearer over time. We treat accessibility as an ongoing effort, not a one-time audit claim.",
        ],
      },
      {
        title: "What we work toward",
        paragraphs: [
          "We aim for readable text, visible focus states, keyboard access to primary shopping actions, and captions or text alternatives on important images where we control the markup.",
        ],
        bullets: [
          "Clear headings and labels on key pages.",
          "Color contrast that remains readable in light and dark modes.",
          "Forms that identify required fields and errors in text.",
          "Support through email, phone, and 24/7 live chat if a flow is blocked.",
        ],
      },
      {
        title: "Known limits",
        paragraphs: [
          "Some product photography, third-party payment widgets, and carrier tracking pages are outside our full control. If a third-party step is hard to complete, contact us and we will help you finish the request another way.",
        ],
      },
      {
        title: "Request assistance",
        paragraphs: [
          "If you have trouble using a page, product listing, or checkout step, email info@lunaavo.us or call +1 (510) 345-2632. Tell us the page you were on and what you were trying to do. We will help you complete your request.",
          "Live chat is available 24/7. Phone support hours are Monday-Friday, 9:00 AM-5:00 PM Pacific Time. Our business address is 2221 Shattuck Ave., Berkeley, CA 94704, United States, for correspondence only.",
        ],
      },
    ],
  },
  {
    slug: "your-privacy-choices",
    title: "Your Privacy Choices",
    description: "How to ask about personal data used for your Lunaavo orders.",
    intro:
      "You may contact info@lunaavo.us with a privacy-related request. Applicable rights depend on relevant privacy laws.",
    groupTitles: ["Accounts, privacy, and security"],
  },
];

export function policyBySlug(slug: string) {
  return POLICY_PAGES.find((page) => page.slug === slug) ?? null;
}

export function groupsForPolicy(policy: PolicyPageDef, groups: FaqGroup[]) {
  if (!policy.groupTitles.length) return [];
  return groups.filter((group) => policy.groupTitles.includes(group.title));
}

export function contentPageTitle(slug: string) {
  return CONTENT_PAGES.find((page) => page.slug === slug)?.title ?? slug;
}
