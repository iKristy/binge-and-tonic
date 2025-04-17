
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Show } from "@/types/Show";
import { User } from "@supabase/supabase-js";

export function useShowStorage(user: User | null) {
  const { toast } = useToast();

  const isShowAlreadyAdded = (shows: Show[], tmdbId: number): boolean => {
    return shows.some(show => show.tmdbId === tmdbId);
  };

  const addShow = async (shows: Show[], setShows: (shows: Show[]) => void, newShow: Omit<Show, "id" | "status">) => {
    try {
      // Check if show already exists in the list
      if (isShowAlreadyAdded(shows, newShow.tmdbId || 0)) {
        toast({
          title: "Show already in your list",
          description: `${newShow.title} is already in your watchlist.`,
          variant: "destructive"
        });
        return false;
      }
      
      const isComplete = newShow.releasedEpisodes >= newShow.totalEpisodes;
      
      // Valid status values in the database are: 'watching', 'completed', 'plan_to_watch', 'dropped'
      // We need to map our app's statuses to these values
      const dbStatus = isComplete ? "completed" : "watching";
      
      const showData = {
        title: newShow.title,
        total_episodes: newShow.totalEpisodes,
        released_episodes: newShow.releasedEpisodes,
        status: dbStatus, // Using database-compatible status values
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
          
          const updatedShows = [newShowWithId, ...shows];
          setShows(updatedShows);
          localStorage.setItem("shows", JSON.stringify(updatedShows));
          
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

  const removeShow = async (shows: Show[], setShows: (shows: Show[]) => void, showId: string) => {
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

  return {
    isShowAlreadyAdded,
    addShow,
    removeShow
  };
}
