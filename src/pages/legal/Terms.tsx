import LegalPage from "@/components/site/LegalPage";
import { TERMS_SECTIONS } from "@/features/legal/content";

/** Carried across from `comingsoonhomrentals-com/src/pages/Terms.tsx`. */
const Terms = () => (
  <LegalPage
    title="Terms of service"
    description="The terms you agree to by using Good Tenants EZ Living."
    sections={TERMS_SECTIONS}
  />
);

export default Terms;
