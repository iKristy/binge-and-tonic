
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Show } from "@/types/Show";
import { TMDbShow, getImageUrl } from "@/services/tmdbApi";
import { useShowSearch } from "@/hooks/useShowSearch";
import { useAuth } from "@/components/AuthProvider";
import SearchBar from "./SearchBar";
import ShowSearchResults from "./ShowSearchResults";
import SelectedShow from "./SelectedShow";
import LoginModal from "./LoginModal";

interface AddShowFormProps {
  onAddShow: (show: Omit<Show, "id" | "status">) => void;
  onCancel: () => void;
}

const formSchema = z.object({
  tmdbId: z.number().min(1, "Please select a show"),
});

const AddShowForm: React.FC<AddShowFormProps> = ({ onAddShow, onCancel }) => {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    searchError,
    selectedShow,
    isLoading,
    handleShowSelect,
    handleSearchClear
  } = useShowSearch();

  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tmdbId: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedShow) return;

    // Check if user is authenticated
    if (!user) {
      // Prepare show data to be passed to the auth page
      const showData = prepareShowData(selectedShow);
      setShowLoginModal(true);
      return;
    }

    // User is authenticated, proceed with adding the show
    const formattedShow = prepareShowData(selectedShow);
    onAddShow(formattedShow);
  };

  const prepareShowData = (show: TMDbShow) => {
    const latestSeason = show.seasons?.sort((a, b) => b.season_number - a.season_number)[0];
    const seasonNumber = latestSeason?.season_number || 1;
    const totalEpisodes = latestSeason?.episode_count || show.number_of_episodes || 0;
    
    // For calculating released episodes, we would ideally need episode air dates
    // As a simplification, we'll assume all episodes are released if the show's last_air_date is more than 
    // the average time it would take for all episodes to air (roughly 1 week per episode)
    const lastAirDate = new Date(show.last_air_date || show.first_air_date);
    const today = new Date();
    const timeDiff = today.getTime() - lastAirDate.getTime();
    const daysSinceLastAir = timeDiff / (1000 * 3600 * 24);
    
    // Estimate released episodes based on time since last air date
    // This is a simplified approach and could be improved with actual episode air dates
    let releasedEpisodes = totalEpisodes;
    if (show.in_production && show.status === 'Returning Series') {
      // If show is still in production, estimate based on weekly releases
      releasedEpisodes = Math.min(totalEpisodes, Math.ceil(daysSinceLastAir / 7));
    }

    return {
      title: show.name,
      imageUrl: show.poster_path ? getImageUrl(show.poster_path) : "/placeholder.svg",
      totalEpisodes,
      releasedEpisodes,
      description: show.overview,
      genre: show.genres?.map(g => g.name).join(", "),
      tmdbId: show.id,
      seasonNumber
    };
  };

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
