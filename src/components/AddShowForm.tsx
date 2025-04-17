
import React from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Show } from "@/types/Show";
import { useAddShowForm } from "@/hooks/useAddShowForm";
import SearchBar from "./SearchBar";
import ShowSearchResults from "./ShowSearchResults";
import SelectedShow from "./SelectedShow";
import LoginModal from "./LoginModal";

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
    showLoginModal,
    setShowLoginModal,
    form,
    handleShowSelect,
    handleSearchClear,
    prepareShowData,
    onSubmit
  } = useAddShowForm(onAddShow);

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...form.register("tmdbId", { valueAsNumber: true })} />
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedShow || isLoading}
            >
              {isLoading ? "Loading..." : "Add Show"}
            </Button>
          </div>
        </form>
      </Form>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={handleCloseLoginModal} 
        showData={selectedShow ? prepareShowData(selectedShow) : undefined}
      />
    </div>
  );
};

export default AddShowForm;
