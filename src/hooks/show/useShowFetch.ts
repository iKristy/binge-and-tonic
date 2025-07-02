
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

  // Set up real-time updates for shows table
  useEffect(() => {
    if (!user) return;

    console.log("Setting up real-time updates for shows");
    
    const channel = supabase
      .channel('show-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shows'
        },
        (payload) => {
          console.log('Show update received:', payload);
          // Refresh shows when any show is updated
          fetchShows();
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    shows,
    setShows,
    isLoading,
    refreshShows: fetchShows
  };
}
