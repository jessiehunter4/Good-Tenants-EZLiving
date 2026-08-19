// Carried across from `Irvine Living Daily/src/data/images.ts`.
// Content rows store a key, not a URL, so the same post can be re-themed
// without a migration. An absolute or rooted path passes straight through.
import hero from "@/assets/hero-irvine.jpg";
import community from "@/assets/post-community.jpg";
import market from "@/assets/post-market.jpg";
import rental from "@/assets/post-rental-1.jpg";
import tenants from "@/assets/post-tenants.jpg";
import ask from "@/assets/ask-hero.jpg";

const IMAGES: Record<string, string> = {
  "hero-irvine": hero,
  "post-community": community,
  "post-market": market,
  "post-rental-1": rental,
  "post-tenants": tenants,
  "ask-hero": ask,
};

export function resolveImage(key: string | null | undefined): string {
  if (!key) return hero;
  if (key.startsWith("http") || key.startsWith("/")) return key;
  return IMAGES[key] ?? hero;
}

export { hero as defaultHeroImage, ask as askHeroImage };
