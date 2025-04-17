
import { v4 as uuidv4 } from "uuid";
import { User } from "@supabase/supabase-js";
import { Show } from "@/types/Show";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useShowStorage(user: User | null) {
  const { toast } = useToast();

  const isShowAlreadyAdded = (shows: Show[], tmdbId: number) => {
    return shows.some(show => show.tmdbId === tmdbId);
  };

  const addShow = async (
    currentShows: Show[],
    setShows: (shows: Show[]) => void,
    newShow: Omit<Show, "id" | "status">
  ) => {
    try {
      if (isShowAlreadyAdded(currentShows, newShow.tmdbId!)) {
        toast({
          title: "Show already in your list",
          description: `${newShow.title} is already in your tracking list.`,
          variant: "destructive"
        });
        return false;
      }

      const show: Show = {
        ...newShow,
        id: uuidv4(),
        status: newShow.releasedEpisodes >= newShow.totalEpisodes ? "complete" : "waiting"
      };

      // Only store in Supabase if the user is logged in
      if (user) {
        // Use Supabase to store the show
        const { error } = await supabase.from("user_shows").insert({
          tmdb_show_id: newShow.tmdbId,
          title: newShow.title,
          poster_url: newShow.imageUrl,
          total_episodes: newShow.totalEpisodes,
          released_episodes: newShow.releasedEpisodes,
          season_number: newShow.seasonNumber,
          status: newShow.releasedEpisodes >= newShow.totalEpisodes ? "completed" : "watching",
          user_id: user.id // Add the user ID to satisfy the RLS policy
        });

        if (error) {
          throw error;
        }
      }

      // Always update local state and localStorage
      setShows([show, ...currentShows]);
      localStorage.setItem("shows", JSON.stringify([show, ...currentShows]));
      
      toast({
        title: "Show added",
        description: `${newShow.title} has been added to your tracking list.`
      });
      
      return true;
    } catch (error: any) {
      console.error("Error adding show:", error);
      toast({
        title: "Failed to add show",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const removeShow = async (
    currentShows: Show[],
    setShows: (shows: Show[]) => void,
    showId: string
  ) => {
    try {
      const filteredShows = currentShows.filter(show => show.id !== showId);
      
      // Only remove from Supabase if the user is logged in
      if (user) {
        // Use Supabase to remove the show
        const { error } = await supabase
          .from("user_shows")
          .delete()
          .eq("id", showId);

        if (error) {
          throw error;
        }
      }

      // Always update local state and localStorage
      setShows(filteredShows);
      localStorage.setItem("shows", JSON.stringify(filteredShows));
      
      toast({
        title: "Show removed",
        description: "The show has been removed from your tracking list."
      });
      
      return true;
    } catch (error: any) {
      console.error("Error removing show:", error);
      toast({
        title: "Failed to remove show",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    isShowAlreadyAdded,
    addShow,
    removeShow
  };
}
