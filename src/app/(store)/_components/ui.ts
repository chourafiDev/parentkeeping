// Storefront layout & button styles (Glozin "EchoZone" design system): one
// place to tweak them. Values read from the theme: Instrument Sans, body
// 15px soft ink, headings 600 with -0.034em tracking, pill buttons (30px
// radius, 600), media with 10px corners inside the page margins.

/** Page width: 1410px max, side padding grows with the screen. */
export const container = "mx-auto w-full max-w-[1410px] px-4 sm:px-6 lg:px-[30px]";

/** Vertical rhythm between sections. */
export const section = "py-12 md:py-[70px]";

/** Pill buttons: 50px tall, semibold (dark = main action, light = on dark media). */
export const pillButton =
	"inline-flex h-[50px] min-w-[180px] items-center justify-center gap-2 rounded-full px-8 text-[15px] font-semibold tracking-[-0.024em] transition-colors";
export const pillDark = `${pillButton} bg-foreground text-background hover:bg-primary`;
export const pillLight = `${pillButton} bg-white text-foreground hover:border hover:border-white hover:bg-foreground hover:text-white`;
export const pillBrand = `${pillButton} bg-primary text-primary-foreground hover:bg-foreground`;

/** Section title + subtitle ("Category Highlights" / one line under it). */
export const sectionTitle = "text-[30px] leading-tight font-semibold tracking-[-0.034em] text-foreground md:text-[35px]";
export const sectionSubtitle = "text-body text-[15px] leading-[1.714]";

/** Small uppercase line above titles on media ("TOP COLLECTIONS"). */
export const eyebrow = "text-xs font-bold tracking-[0.02em] uppercase";

/** Rounded media frame (banners, cards). */
export const media = "relative isolate overflow-hidden rounded-[10px]";
