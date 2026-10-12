import "server-only";
import { getSettings } from "@/server/queries/settings";
import type { EmailFooter } from "./buyer";

/** Support email + postal address (Settings → Contact) for buyer emails. */
export async function buyerFooter(): Promise<EmailFooter> {
  const { contact } = await getSettings("contact");
  return { supportEmail: contact.supportEmail, postalAddress: contact.postalAddress };
}
