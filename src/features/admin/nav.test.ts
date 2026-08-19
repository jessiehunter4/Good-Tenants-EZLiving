import { describe, expect, it } from "vitest";
import { ADMIN_NAV_ITEMS, isActivePath } from "./nav";

const byPath = (to: string) => {
  const item = ADMIN_NAV_ITEMS.find((i) => i.to === to);
  if (!item) throw new Error(`no nav item for ${to}`);
  return item;
};

describe("isActivePath", () => {
  it("keeps Overview from lighting up on every admin page", () => {
    // Without `exact`, /admin is a prefix of every other admin route and two
    // items would look selected at once.
    expect(isActivePath(byPath("/admin"), "/admin")).toBe(true);
    expect(isActivePath(byPath("/admin"), "/admin/articles")).toBe(false);
  });

  it("keeps a section selected on its own sub-pages", () => {
    expect(isActivePath(byPath("/admin/articles"), "/admin/articles")).toBe(true);
    expect(isActivePath(byPath("/admin/articles"), "/admin/articles/new")).toBe(true);
  });
});

describe("ADMIN_NAV_ITEMS", () => {
  it("has no duplicate destinations", () => {
    const paths = ADMIN_NAV_ITEMS.map((i) => i.to);
    expect(new Set(paths).size).toBe(paths.length);
  });
});
