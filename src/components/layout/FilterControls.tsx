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
          className={`w-full min-w-[200px] ${isTablet ? 'sm:w-[200px]' : 'sm:w-[220px]'}`}
          aria-label="Filter TV shows"
        >
          <SelectValue placeholder="Filter shows">
            <div className="flex items-center justify-between w-full">
              <span>
                {filter === "all" && "All shows"}
                {filter === "complete" && "Ready to binge"}
                {filter === "waiting" && "Waiting for episodes"}
              </span>
              <CountBadge 
                count={
                  filter === "all" ? showCounts.total :
                  filter === "complete" ? showCounts.complete :
                  showCounts.waiting
                } 
                className="ml-2 flex-shrink-0"
              />
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent aria-label="Show filter options" className="min-w-[200px]">
          <SelectGroup>
            <SelectItem value="all" className="flex items-center justify-between">
              <span>All shows</span>
              <CountBadge count={showCounts.total} />
            </SelectItem>
            <SelectItem value="complete" className="flex items-center justify-between">
              <span>Ready to binge</span>
              <CountBadge count={showCounts.complete} />
            </SelectItem>
            <SelectItem value="waiting" className="flex items-center justify-between">
              <span>Waiting for episodes</span>
              <CountBadge count={showCounts.waiting} />
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select 
        value={sortBy} 
        onValueChange={(value) => onSortChange(value as SortType)}
      >
        <SelectTrigger 
          className={`w-full min-w-[180px] ${isTablet ? 'sm:w-[160px]' : 'sm:w-[180px]'}`}
          aria-label="Sort TV shows"
        >
          <div className="flex items-center gap-2">
            <SortDesc className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <SelectValue placeholder="Sort by">
              <span>
                {sortBy === "alphabetical" && "Alphabetical"}
                {sortBy === "status" && "By show status"}
                {sortBy === "releaseDate" && "By release date"}
                {sortBy === "dateAdded" && "By date added"}
              </span>
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent aria-label="Sorting options" className="min-w-[180px]">
          <SelectGroup>
            <SelectItem value="alphabetical">
              <span>Alphabetical</span>
            </SelectItem>
            <SelectItem value="status">
              <span>By show status</span>
            </SelectItem>
            <SelectItem value="releaseDate">
              <span>By release date</span>
            </SelectItem>
            <SelectItem value="dateAdded">
              <span>By date added</span>
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterControls;
