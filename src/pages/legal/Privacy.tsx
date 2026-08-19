import LegalPage from "@/components/site/LegalPage";
import { PRIVACY_SECTIONS } from "@/features/legal/content";

/** Carried across from `comingsoonhomrentals-com/src/pages/Privacy.tsx`. */
const Privacy = () => (
  <LegalPage
    title="Privacy policy"
    description="What we collect, how it is used, and who can see it."
    sections={PRIVACY_SECTIONS}
  />
);

export default Privacy;
