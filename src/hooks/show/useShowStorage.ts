
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

      // Only store in Supabase if the user is logged in
      if (user) {
        // Upsert the catalog row via a privileged edge function; the shows
        // table is no longer directly writable from the client.
        const { data: addShowData, error: addShowError } = await supabase.functions.invoke("add-show", {
          body: {
            tmdbId: newShow.tmdbId,
            title: newShow.title,
            posterUrl: newShow.imageUrl,
            totalEpisodes: newShow.totalEpisodes,
            releasedEpisodes: newShow.releasedEpisodes,
            seasonNumber: newShow.seasonNumber,
          },
        });

        if (addShowError) {
          throw addShowError;
        }

        const showId: number | undefined = addShowData?.showId;
        if (!showId) {
          throw new Error("Failed to register show in catalog");
        }
        
        // Now create the relationship between user and show
        const { data: relation, error: relationError } = await supabase
          .from("user_show_relations")
          .insert({
            user_id: user.id,
            show_id: showId,
            status: newShow.releasedEpisodes >= newShow.totalEpisodes ? "completed" : "watching"
          })
          .select("id")
          .single();
          
        if (relationError) {
          throw relationError;
        }

        // Create the show representation for the UI
        const show: Show = {
          id: relation.id, // Use the relation ID as the show ID in the UI
          title: newShow.title,
          imageUrl: newShow.imageUrl,
          totalEpisodes: newShow.totalEpisodes,
          releasedEpisodes: newShow.releasedEpisodes,
          status: newShow.releasedEpisodes >= newShow.totalEpisodes ? "complete" : "waiting",
          seasonNumber: newShow.seasonNumber,
          tmdbId: newShow.tmdbId
        };
        
        // Update the local state
        setShows([show, ...currentShows]);
        localStorage.setItem("shows", JSON.stringify([show, ...currentShows]));
      } else {
        // For non-authenticated users, just use local storage
        const show: Show = {
          id: uuidv4(),
          title: newShow.title,
          imageUrl: newShow.imageUrl,
          totalEpisodes: newShow.totalEpisodes,
          releasedEpisodes: newShow.releasedEpisodes,
          status: newShow.releasedEpisodes >= newShow.totalEpisodes ? "complete" : "waiting",
          seasonNumber: newShow.seasonNumber,
          tmdbId: newShow.tmdbId
        };
        
        setShows([show, ...currentShows]);
        localStorage.setItem("shows", JSON.stringify([show, ...currentShows]));
      }
      
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
        // Delete the user-show relation
        const { error } = await supabase
          .from("user_show_relations")
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
