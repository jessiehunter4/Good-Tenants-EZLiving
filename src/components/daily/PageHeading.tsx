import type { ReactNode } from "react";

type PageHeadingProps = {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: ReactNode;
};

/** The heading block every daily page opens with. */
export const PageHeading = ({ eyebrow, title, intro, children }: PageHeadingProps) => (
  <header className="mb-10">
    <p className="text-sm font-bold uppercase tracking-widest text-espresso-muted">{eyebrow}</p>
    <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-espresso sm:text-5xl">{title}</h1>
    {intro && <p className="mt-3 max-w-2xl text-lg text-espresso-muted">{intro}</p>}
    {children}
  </header>
);

export default PageHeading;
