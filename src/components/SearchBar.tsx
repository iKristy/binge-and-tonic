
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchQuery, 
  onSearchChange, 
  onSearchClear 
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Just prevent the default form submission, 
    // as we're already handling search with onChange
  };
  
  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
        <Search className="ml-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Input
          type="text"
          value={searchQuery}
          onChange={handleChange}
          placeholder="Search for TV shows... (min 3 characters)"
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          aria-label="Search TV shows"
        />
        {searchQuery && (
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 mr-1"
            onClick={onSearchClear}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
