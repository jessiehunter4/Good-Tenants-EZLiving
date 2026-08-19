import type { Attribution } from "@/features/rentals/compliance";
import { INQUIRY_DISCLOSURE } from "@/features/rentals/compliance";

/**
 * The credit line that has to appear with a syndicated listing.
 *
 * Not decoration: displaying feed data without naming the MLS, the listing
 * number and the office that holds it is the thing that makes the display
 * non-compliant. It renders even when fields are missing, because a partial
 * credit is better than none.
 */
export const ListingAttribution = ({ attribution }: { attribution: Attribution }) => (
  <div className="space-y-1 border-t border-clay/50 pt-4 text-xs text-espresso-muted">
    <p>
      {attribution.mlsNumber && <>MLS #{attribution.mlsNumber} · </>}
      Source: {attribution.sourceMls}
      {attribution.lastUpdated && <> · Updated {attribution.lastUpdated}</>}
    </p>
    {attribution.officeName && (
      <p>
        Listed by {attribution.officeName}
        {attribution.agentName && <> · {attribution.agentName}</>}
      </p>
    )}
    <p>{INQUIRY_DISCLOSURE}</p>
  </div>
);

export default ListingAttribution;
