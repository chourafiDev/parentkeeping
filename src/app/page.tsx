import { SITE } from "@/lib/site";

// Placeholder until the storefront is built (see the build spec).
export default function HomePage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{SITE.name}</h1>
        <p className="text-muted-foreground mt-1">Coming soon.</p>
      </div>
    </main>
  );
}
