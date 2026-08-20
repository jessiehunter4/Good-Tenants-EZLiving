import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Carried across from `comingsoonhomrentals-com/src/components/home/
 * ListingIdSearch.tsx`. Someone holding a flyer or a text message with a
 * listing number types it here instead of hunting through search.
 */
export const ListingIdSearch = () => {
  const [listingId, setListingId] = useState("");
  const navigate = useNavigate();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = listingId.trim();
    if (!trimmed) return;
    navigate(`/rentals?id=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={submit} className="mx-auto flex max-w-md gap-2">
      <Input
        value={listingId}
        onChange={(e) => setListingId(e.target.value)}
        placeholder="Enter Listing ID"
        aria-label="Listing ID"
        className="flex-1"
      />
      <Button
        type="submit"
        disabled={!listingId.trim()}
        className="bg-cta-browse text-cta-browse-foreground hover:bg-cta-browse/90"
      >
        <Search className="mr-2 h-4 w-4" />
        Search
      </Button>
    </form>
  );
};

export default ListingIdSearch;
