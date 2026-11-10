import { ChatbotWidget } from "@wp-chatbot/nextjs";

// Asks the chat widget to take this site's own brand colour (and its font, which it always does).
// The installed kit predates the `theme` prop, so this sets it on the config the kit writes just
// before. When the kit is upgraded, pass `theme="auto"` to <ChatbotWidget /> and delete this.
const AUTO_THEME = "window.wpcWidgetConfig && (window.wpcWidgetConfig.theme = 'auto');";

/**
 * Shows the chat widget only when NEXT_PUBLIC_WPC_ENABLED is "true".
 * Set it for Vercel Preview first. Leave it unset for Production until the store agrees.
 * The widget reads NEXT_PUBLIC_WPC_API_BASE, NEXT_PUBLIC_WPC_PUBLISHABLE_KEY and
 * NEXT_PUBLIC_WPC_SITE_URL itself.
 */
export function ChatbotGate() {
  if (process.env.NEXT_PUBLIC_WPC_ENABLED !== "true") return null;
  return (
    <>
      <ChatbotWidget displayName="Alex" />
      <script id="wpc-widget-theme" dangerouslySetInnerHTML={{ __html: AUTO_THEME }} />
    </>
  );
}
