import PartnerPitch from "@/components/site/PartnerPitch";
import { REALTOR_PITCH } from "@/features/hub/content";

/** Carried across from `Good Tenants Hub/src/routes/realtors.tsx`. */
const Realtors = () => (
  <PartnerPitch pitch={REALTOR_PITCH} role="agent" registerLabel="Join as an agent" />
);

export default Realtors;
