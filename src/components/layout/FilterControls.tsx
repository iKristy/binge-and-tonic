
import React from "react";
import { SortDesc } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CountBadge } from "@/components/ui/count-badge";
import { FilterType } from "@/hooks/show/useShowFilter";
import { SortType } from "@/hooks/show/useShowSort";

interface FilterControlsProps {
  filter: FilterType;
  onFilterChange: (value: FilterType) => void;
  sortBy: SortType;
  onSortChange: (value: SortType) => void;
  showCounts: {
    total: number;
    complete: number;
    waiting: number;
  };
}

const FilterControls: React.FC<FilterControlsProps> = ({
  filter,
  onFilterChange,
  sortBy,
  onSortChange,
  showCounts
}) => {
  // Get the appropriate count based on current filter
  const getFilterCount = () => {
    switch(filter) {
      case "all": return showCounts.total;
      case "complete": return showCounts.complete;
      case "waiting": return showCounts.waiting;
      default: return showCounts.total;
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
      <Select 
        value={filter} 
        onValueChange={(value) => onFilterChange(value as FilterType)}
      >
        <SelectTrigger 
          className="w-full md:w-[180px]" 
          aria-label="Filter TV shows"
        >
          <div className="flex items-center justify-between w-full">
            <SelectValue placeholder="Filter shows" />
            <CountBadge
              count={getFilterCount()}
              className="ml-2"
            />
          </div>
        </SelectTrigger>
        <SelectContent aria-label="Show filter options">
          <SelectGroup>
            <SelectItem 
              value="all" 
              className="relative pr-16"
            >
              <span>All shows</span> 
              <CountBadge 
                count={showCounts.total} 
                className="absolute right-2"
              />
            </SelectItem>
            <SelectItem 
              value="complete" 
              className="relative pr-16"
            >
              <span>Ready to binge</span> 
              <CountBadge 
                count={showCounts.complete} 
                className="absolute right-2"
              />
            </SelectItem>
            <SelectItem 
              value="waiting" 
              className="relative pr-16"
            >
              <span>Waiting for episodes</span> 
              <CountBadge 
                count={showCounts.waiting} 
                className="absolute right-2"
              />
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select 
        value={sortBy} 
        onValueChange={(value) => onSortChange(value as SortType)}
      >
        <SelectTrigger 
          className="w-full md:w-[180px]" 
          aria-label="Sort TV shows"
        >
          <div className="flex items-center gap-2">
            <SortDesc className="h-4 w-4" aria-hidden="true" />
            <SelectValue placeholder="Sort by" />
          </div>
        </SelectTrigger>
        <SelectContent aria-label="Sorting options">
          <SelectGroup>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
            <SelectItem value="status">By show status</SelectItem>
            <SelectItem value="releaseDate">By release date</SelectItem>
            <SelectItem value="dateAdded">By date added</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterControls;
