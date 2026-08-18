
import { useState } from "react";
import { Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface FilterBarProps {
  incomeRange: [number, number];
  setIncomeRange: (range: [number, number]) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  isFilteringByDate: boolean;
  setIsFilteringByDate: (isFiltering: boolean) => void;
  clearFilters: () => void;
}

const FilterBar = ({
  incomeRange,
  setIncomeRange,
  selectedDate,
  setSelectedDate,
  isFilteringByDate,
  setIsFilteringByDate,
  clearFilters,
}: FilterBarProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {/* Income Range Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Income: ${incomeRange[0].toLocaleString()} - ${incomeRange[1].toLocaleString()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <h4 className="font-medium">Household Income Range</h4>
            <Slider
              defaultValue={incomeRange}
              min={0}
              max={20000}
              step={500}
              value={incomeRange}
              onValueChange={(value) => setIncomeRange(value as [number, number])}
            />
            <div className="flex justify-between">
              <span>${incomeRange[0].toLocaleString()}</span>
              <span>${incomeRange[1].toLocaleString()}</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Date Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={`flex items-center gap-2 ${isFilteringByDate ? 'bg-role-tenant/10' : ''}`}>
            <Calendar className="h-4 w-4" />
            {selectedDate && isFilteringByDate 
              ? `Moves after: ${format(selectedDate, 'PP')}` 
              : 'Move-in Date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);
              setIsFilteringByDate(!!date);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Clear Filters Button */}
      <Button variant="ghost" onClick={clearFilters} size="sm">
        Clear Filters
      </Button>
    </div>
  );
};

export default FilterBar;
