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
import { useIsTablet } from "@/hooks/use-tablet";

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
  const isTablet = useIsTablet();

  return (
    <div className="flex flex-col sm:flex-row md:items-center gap-3 md:gap-4">
      <Select 
        value={filter} 
        onValueChange={(value) => onFilterChange(value as FilterType)}
      >
        <SelectTrigger 
          className={`w-full ${isTablet ? 'sm:w-[200px]' : 'sm:w-[220px]'}`}
          aria-label="Filter TV shows"
        >
          <SelectValue placeholder="Filter shows" />
        </SelectTrigger>
        <SelectContent aria-label="Show filter options">
          <SelectGroup>
            <SelectItem value="all" className="flex items-center justify-between">
              All shows <CountBadge count={showCounts.total} />
            </SelectItem>
            <SelectItem value="complete" className="flex items-center justify-between">
              Ready to binge <CountBadge count={showCounts.complete} />
            </SelectItem>
            <SelectItem value="waiting" className="flex items-center justify-between">
              Waiting for episodes <CountBadge count={showCounts.waiting} />
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select 
        value={sortBy} 
        onValueChange={(value) => onSortChange(value as SortType)}
      >
        <SelectTrigger 
          className={`w-full ${isTablet ? 'sm:w-[160px]' : 'sm:w-[180px]'}`}
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
