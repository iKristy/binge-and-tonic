
import { useState, useEffect } from "react";
import { Show } from "@/types/Show";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

export function useShowFetch(user: User | null) {
  const [shows, setShows] = useState<Show[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      
      // Fetch shows for current user with the new relational structure
      const { data: relations, error: relationsError } = await supabase
        .from("user_show_relations")
        .select(`
          id,
          status,
          watched,
          show:show_id(
            id,
            tmdb_id,
            title,
            poster_url,
            total_episodes,
            released_episodes,
            season_number
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (relationsError) {
        throw relationsError;
      }

      // Transform joined data for the UI
      if (relations) {
        const transformedShows: Show[] = relations.map((relation: any) => ({
          id: relation.id,
          title: relation.show.title,
          imageUrl: relation.show.poster_url || "/placeholder.svg",
          totalEpisodes: relation.show.total_episodes,
          releasedEpisodes: relation.show.released_episodes || 0,
          status: relation.show.released_episodes >= relation.show.total_episodes ? "complete" : "waiting",
          seasonNumber: relation.show.season_number,
          tmdbId: relation.show.tmdb_id,
          watched: relation.watched || false
        }));
        
        setShows(transformedShows);
        
        // Also save to localStorage as backup
        localStorage.setItem("shows", JSON.stringify(transformedShows));
        
        // After fetching shows, trigger the auto-update function if there are shows
        if (relations.length > 0) {
          await triggerShowsUpdate();
        }
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

  // Function to trigger the update-shows edge function
  const triggerShowsUpdate = async () => {
    try {
      // Call the update-shows edge function without waiting for it to complete
      supabase.functions.invoke("update-shows", {
        body: { action: "update" }
      }).then(({ error }) => {
        if (error) {
          console.error("Background update error:", error);
        } else {
          console.log("Shows update triggered in background");
        }
      });
    } catch (error) {
      console.error("Error triggering shows update:", error);
      // We don't need to show an error toast as this is a background operation
    }
  };

  useEffect(() => {
    fetchShows();
  }, [user]);

  return {
    shows,
    setShows,
    isLoading,
    refreshShows: fetchShows
  };
}
