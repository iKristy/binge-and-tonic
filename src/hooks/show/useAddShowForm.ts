
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useShowSearch } from "@/hooks/show/useShowSearch";
import { useAuth } from "@/components/AuthProvider";
import { TMDbShow, getImageUrl, getSeasonDetails } from "@/services/tmdbApi";
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tmdbId: 0,
    },
  });

  // When a show is selected, update the form value
  if (selectedShow && selectedShow.id !== form.getValues().tmdbId) {
    form.setValue("tmdbId", selectedShow.id);
  }

  const prepareShowData = async (show: TMDbShow) => {
    const today = new Date();

    // Track the latest season that has already started airing (mirrors the
    // server-side refresh logic). An announced-but-unaired season must not be
    // treated as the current season, otherwise it looks like a released season
    // with zero episodes out.
    const airedSeasons = (show.seasons || []).filter(season => {
      if (season.season_number === 0) return false;
      if (!season.air_date) return false;
      return new Date(season.air_date) <= today;
    });
    const latestSeason = airedSeasons.sort((a, b) => b.season_number - a.season_number)[0];
    const seasonNumber = latestSeason?.season_number || 1;
    const totalEpisodes = latestSeason?.episode_count || show.number_of_episodes || 0;

    // Initialize with default values
    let releasedEpisodes = 0;
    
    try {
      // Get actual episode data from TMDb
      const seasonDetails = await getSeasonDetails(show.id, seasonNumber);
      
      if (seasonDetails?.episodes) {
        // Count episodes that have already aired
        releasedEpisodes = seasonDetails.episodes.filter(episode => {
          if (!episode.air_date) return false;
          const airDate = new Date(episode.air_date);
          return airDate <= today;
        }).length;
        
        console.log(`Based on air dates: ${releasedEpisodes} of ${totalEpisodes} episodes have been released`);
      }
    } catch (error) {
      console.error("Error fetching season details:", error);
      // Fallback to the old logic if we can't get episode data
      const lastAirDate = new Date(show.last_air_date || show.first_air_date);
      const timeDiff = today.getTime() - lastAirDate.getTime();
      const daysSinceLastAir = timeDiff / (1000 * 3600 * 24);
      
      releasedEpisodes = totalEpisodes;
      if (show.in_production && show.status === 'Returning Series') {
        releasedEpisodes = Math.min(totalEpisodes, Math.ceil(daysSinceLastAir / 7));
      }
      
      console.log(`Using fallback logic: ${releasedEpisodes} of ${totalEpisodes} episodes have been released`);
    }

    // A concretely scheduled next episode that belongs to a season newer than
    // the one we track means a new season is announced but hasn't aired yet.
    const nextEpisode = show.next_episode_to_air;
    const nextSeasonAirDate =
      nextEpisode && nextEpisode.season_number > seasonNumber && nextEpisode.air_date
        ? nextEpisode.air_date
        : null;

    return {
      title: show.name,
      imageUrl: show.poster_path ? getImageUrl(show.poster_path) : "/placeholder.svg",
      totalEpisodes,
      releasedEpisodes,
      description: show.overview,
      genre: show.genres?.map(g => g.name).join(", "),
      tmdbId: show.id,
      seasonNumber,
      seriesStatus: show.status,
      nextSeasonAirDate
    };
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("onSubmit called with values:", values);
    if (!selectedShow) {
      console.error("No show selected");
      return;
    }

    // Check if user is authenticated
    if (!user) {
      console.log("User not authenticated, showing login modal");
      setShowLoginModal(true);
      return;
    }

    // User is authenticated, proceed with adding the show
    console.log("User authenticated, adding show");
    const formattedShow = await prepareShowData(selectedShow);
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
