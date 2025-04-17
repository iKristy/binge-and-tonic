
import React from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Show } from "@/types/Show";
import { useAddShowForm } from "@/hooks/useAddShowForm";
import SearchBar from "./SearchBar";
import ShowSearchResults from "./ShowSearchResults";
import SelectedShow from "./SelectedShow";

interface AddShowFormProps {
  onAddShow: (show: Omit<Show, "id" | "status">) => void;
  onCancel: () => void;
}

const AddShowForm: React.FC<AddShowFormProps> = ({ onAddShow, onCancel }) => {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    searchError,
    selectedShow,
    isLoading,
    form,
    handleShowSelect,
    handleSearchClear,
    onSubmit
  } = useAddShowForm(onAddShow);

  // Create a form submission handler that explicitly calls onSubmit with form values
  const handleFormSubmit = form.handleSubmit((values) => {
    console.log("Form submitted with values:", values);
    onSubmit(values);
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <SearchBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchClear={handleSearchClear}
        />
        
        {(searchResults.length > 0 || isSearching || searchError) && (
          <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-md">
            <ShowSearchResults 
              results={searchResults} 
              onSelectShow={handleShowSelect}
              isLoading={isSearching}
              error={searchError}
            />
          </div>
        )}
      </div>

      {selectedShow && (
        <SelectedShow show={selectedShow} isLoading={isLoading} />
      )}

      <Form {...form}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <input type="hidden" {...form.register("tmdbId", { valueAsNumber: true })} />
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedShow || isLoading}
            >
              {isLoading ? "Loading..." : "Add show"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddShowForm;
