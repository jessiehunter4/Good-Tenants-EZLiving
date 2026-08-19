import SiteLayout from "@/components/site/SiteLayout";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import type { LegalSection } from "@/features/legal/content";
import { LEGAL_EFFECTIVE_DATE } from "@/features/legal/content";

type LegalPageProps = {
  title: string;
  description: string;
  sections: readonly LegalSection[];
};

/** Both legal pages have the same shape, so they share one renderer. */
export const LegalPage = ({ title, description, sections }: LegalPageProps) => {
  useDocumentMeta({ title: `${title} — Good Tenants EZ Living`, description });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-espresso">{title}</h1>
        <p className="mt-2 text-sm text-espresso-muted">
          Effective {LEGAL_EFFECTIVE_DATE}
        </p>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-bold text-espresso">{section.heading}</h2>
              <div className="mt-3 space-y-3">
                {section.blocks.map((block, i) =>
                  block.kind === "p" ? (
                    <p key={i} className="leading-relaxed text-espresso-muted">
                      {block.text}
                    </p>
                  ) : (
                    <ul key={i} className="list-disc space-y-2 pl-6 text-espresso-muted">
                      {block.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
};

export default LegalPage;
