import PartnerPitch from "@/components/site/PartnerPitch";
import { LANDLORD_PITCH } from "@/features/hub/content";

/** Carried across from `Good Tenants Hub/src/routes/landlords.tsx`. */
const Landlords = () => (
  <PartnerPitch pitch={LANDLORD_PITCH} role="landlord" registerLabel="List a property" />
);

export default Landlords;
