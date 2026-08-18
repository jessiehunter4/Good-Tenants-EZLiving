
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface PropertyFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  priceRange: [number, number];
  setPriceRange: (value: [number, number]) => void;
  bedrooms: string;
  setBedrooms: (value: string) => void;
  propertyType: string;
  setPropertyType: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  cities: string[];
  filteredCount: number;
  totalCount: number;
  onClearFilters: () => void;
}

const PropertyFilters = ({
  searchQuery,
  setSearchQuery,
  priceRange,
  setPriceRange,
  bedrooms,
  setBedrooms,
  propertyType,
  setPropertyType,
  city,
  setCity,
  cities,
  filteredCount,
  totalCount,
  onClearFilters,
}: PropertyFiltersProps) => {
  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by address, city, or description..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Price Range</label>
          <Slider
            value={[priceRange[0], priceRange[1]]}
            onValueChange={handlePriceRangeChange}
            max={10000}
            min={0}
            step={100}
            className="mb-2"
          />
          <div className="text-xs text-muted-foreground">
            ${priceRange[0]} - ${priceRange[1]}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Bedrooms</label>
          <Select value={bedrooms} onValueChange={setBedrooms}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="0">Studio</SelectItem>
              <SelectItem value="1">1 Bedroom</SelectItem>
              <SelectItem value="2">2 Bedrooms</SelectItem>
              <SelectItem value="3">3 Bedrooms</SelectItem>
              <SelectItem value="4">4+ Bedrooms</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Property Type</label>
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Type</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="townhouse_condo">Townhouse/Condo</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">City</label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any City</SelectItem>
              {cities.map(cityName => (
                <SelectItem key={cityName} value={cityName}>{cityName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>Showing {filteredCount} of {totalCount} properties</span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onClearFilters}
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default PropertyFilters;
