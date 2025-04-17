
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
  showCounts,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
      <Select value={filter} onValueChange={(value) => onFilterChange(value as FilterType)}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Filter Shows" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">All Shows ({showCounts.total})</SelectItem>
            <SelectItem value="complete">Ready to Binge ({showCounts.complete})</SelectItem>
            <SelectItem value="waiting">Waiting for Episodes ({showCounts.waiting})</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortType)}>
        <SelectTrigger className="w-full md:w-[180px]">
          <div className="flex items-center gap-2">
            <SortDesc className="h-4 w-4" />
            <SelectValue placeholder="Sort By" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
            <SelectItem value="status">By Show Status</SelectItem>
            <SelectItem value="releaseDate">By Release Date</SelectItem>
            <SelectItem value="dateAdded">By Date Added</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterControls;
