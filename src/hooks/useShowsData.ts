
import { useState, useEffect } from "react";
import { Show } from "@/types/Show";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

export type FilterType = "all" | "complete" | "waiting";

export function useShowsData(user: User | null) {
  const [shows, setShows] = useState<Show[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const { toast } = useToast();

  const fetchShows = async () => {
    try {
      setIsLoading(true);
      
      // If not logged in, we'll use local storage for demo purposes
      if (!user) {
        const localShows = localStorage.getItem("shows");
        if (localShows) {
          setShows(JSON.parse(localShows));
        }
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from("user_shows")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        const transformedShows: Show[] = data.map(show => ({
          id: show.id,
          title: show.title,
          imageUrl: show.poster_url || "/placeholder.svg",
          totalEpisodes: show.total_episodes,
          releasedEpisodes: show.released_episodes || 0,
          status: show.released_episodes >= show.total_episodes ? "complete" : "waiting",
          seasonNumber: show.season_number,
          tmdbId: show.tmdb_show_id
        }));
        setShows(transformedShows);
        
        // Also save to localStorage as backup
        localStorage.setItem("shows", JSON.stringify(transformedShows));
      }
    } catch (error: any) {
      console.error("Error fetching shows:", error.message);
      toast({
        title: "Error fetching shows",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShows();
  }, [user]);

  const isShowAlreadyAdded = (tmdbId: number): boolean => {
    return shows.some(show => show.tmdbId === tmdbId);
  };

  const addShow = async (newShow: Omit<Show, "id" | "status">) => {
    try {
      // Check if show already exists in the list
      if (isShowAlreadyAdded(newShow.tmdbId || 0)) {
        toast({
          title: "Show already in your list",
          description: `${newShow.title} is already in your watchlist.`,
          variant: "destructive"
        });
        return false;
      }
      
      const isComplete = newShow.releasedEpisodes >= newShow.totalEpisodes;
      const showData = {
        title: newShow.title,
        total_episodes: newShow.totalEpisodes,
        released_episodes: newShow.releasedEpisodes,
        status: isComplete ? "complete" : "watching", // Changed from "waiting" to "watching" to match DB constraint
        poster_url: newShow.imageUrl,
        tmdb_show_id: newShow.tmdbId || 0,
        season_number: newShow.seasonNumber || 1
      };
      
      // User must be logged in at this point
      if (user) {
        const { data, error } = await supabase
          .from("user_shows")
          .insert({
            ...showData,
            user_id: user.id
          })
          .select();

        if (error) throw error;
        
        if (data && data[0]) {
          const newShowWithId: Show = {
            id: data[0].id,
            title: data[0].title,
            imageUrl: data[0].poster_url || "/placeholder.svg",
            totalEpisodes: data[0].total_episodes,
            releasedEpisodes: data[0].released_episodes || 0,
            status: isComplete ? "complete" : "waiting", // We keep our application logic as is
            seasonNumber: data[0].season_number,
            tmdbId: data[0].tmdb_show_id
          };
          
          setShows([newShowWithId, ...shows]);
          localStorage.setItem("shows", JSON.stringify([newShowWithId, ...shows]));
          
          toast({
            title: "Show Added",
            description: `${newShowWithId.title} has been added to your list.`
          });
          
          return true;
        }
      }
      
      return false;
    } catch (error: any) {
      console.error("Error adding show:", error.message);
      toast({
        title: "Error adding show",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const removeShow = async (showId: string) => {
    try {
      if (!user) {
        // Handle local storage removal for demo
        const updatedShows = shows.filter(show => show.id !== showId);
        setShows(updatedShows);
        localStorage.setItem("shows", JSON.stringify(updatedShows));
        toast({
          title: "Show Removed",
          description: "The show has been removed from your list."
        });
        return true;
      }
      
      // Remove from database if logged in
      const { error } = await supabase
        .from("user_shows")
        .delete()
        .eq('id', showId);
        
      if (error) throw error;
      
      // Update state
      const showToRemove = shows.find(show => show.id === showId);
      const updatedShows = shows.filter(show => show.id !== showId);
      setShows(updatedShows);
      
      // Update local storage as backup
      localStorage.setItem("shows", JSON.stringify(updatedShows));
      
      toast({
        title: "Show Removed",
        description: `${showToRemove?.title || 'Show'} has been removed from your list.`
      });
      
      return true;
    } catch (error: any) {
      console.error("Error removing show:", error.message);
      toast({
        title: "Error removing show",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const filteredShows = shows.filter((show) => {
    if (filter === "all") return true;
    if (filter === "complete") return show.status === "complete" || show.releasedEpisodes >= show.totalEpisodes;
    return show.status === "waiting" && show.releasedEpisodes < show.totalEpisodes;
  });
  
  const completeCount = shows.filter(show => 
    show.status === "complete" || show.releasedEpisodes >= show.totalEpisodes
  ).length;

  return {
    shows,
    filteredShows,
    isLoading,
    filter,
    setFilter,
    addShow,
    removeShow,
    completeCount,
    waitingCount: shows.length - completeCount,
    totalCount: shows.length
  };
}
