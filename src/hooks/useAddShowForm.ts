
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { useShowSearch } from "@/hooks/useShowSearch";
import { useAuth } from "@/components/AuthProvider";
import { TMDbShow, getImageUrl } from "@/services/tmdbApi";
import { Show } from "@/types/Show";

const formSchema = z.object({
  tmdbId: z.number().min(1, "Please select a show"),
});

export function useAddShowForm(onAddShow: (show: Omit<Show, "id" | "status">) => void) {
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
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tmdbId: 0,
    },
  });

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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedShow) return;

    // Check if user is authenticated
    if (!user) {
      // Prepare show data to be passed to the auth page
      setShowLoginModal(true);
      return;
    }

    // User is authenticated, proceed with adding the show
    const formattedShow = prepareShowData(selectedShow);
    onAddShow(formattedShow);
  };

  return {
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
  };
}
