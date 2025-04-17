
import React, { useEffect, useState } from "react";
import { Show } from "@/types/Show";
import ShowList from "@/components/ShowList";
import ShowDetails from "@/components/ShowDetails";
import AddShowForm from "@/components/AddShowForm";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { v4 as uuidv4 } from "uuid";
import { PlusCircle, TvIcon, LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type FilterType = "all" | "ready" | "waiting";

const Index: React.FC = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  // Fetch shows from Supabase
  const fetchShows = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("user_shows")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        // Transform Supabase data to our Show type
        const transformedShows: Show[] = data.map(show => ({
          id: show.id,
          title: show.title,
          imageUrl: show.poster_url || "/placeholder.svg",
          currentEpisodes: show.current_episodes,
          episodesNeeded: show.total_episodes,
          status: show.current_episodes >= show.total_episodes ? "ready" : "waiting",
          description: show.description,
          genre: show.genre
        }));
        setShows(transformedShows);
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

  const handleAddShow = async (newShow: Omit<Show, "id" | "status">) => {
    try {
      const episodesReady = newShow.currentEpisodes >= newShow.episodesNeeded;
      
      // Save to Supabase
      const { data, error } = await supabase
        .from("user_shows")
        .insert({
          tmdb_show_id: parseInt(newShow.tmdbId?.toString() || "0"),
          title: newShow.title,
          current_episodes: newShow.currentEpisodes,
          total_episodes: newShow.episodesNeeded,
          status: episodesReady ? "completed" : "watching",
          poster_url: newShow.imageUrl,
          description: newShow.description || "",
          genre: newShow.genre || ""
        })
        .select();

      if (error) throw error;
      
      if (data && data[0]) {
        const show: Show = {
          id: data[0].id,
          title: data[0].title,
          imageUrl: data[0].poster_url || "/placeholder.svg",
          currentEpisodes: data[0].current_episodes,
          episodesNeeded: data[0].total_episodes,
          status: episodesReady ? "ready" : "waiting",
          description: data[0].description,
          genre: data[0].genre
        };
        
        setShows([show, ...shows]);
        
        toast({
          title: "Show Added",
          description: `${show.title} has been added to your list.`
        });
      }
      
      setIsAddFormOpen(false);
    } catch (error: any) {
      toast({
        title: "Error adding show",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleUpdateShow = async (id: string, episodeDelta: number) => {
    try {
      const show = shows.find(s => s.id === id);
      if (!show) return;
      
      const newEpisodeCount = Math.max(0, show.currentEpisodes + episodeDelta);
      const newStatus = newEpisodeCount >= show.episodesNeeded ? "completed" : "watching";
      
      // Update in Supabase
      const { error } = await supabase
        .from("user_shows")
        .update({
          current_episodes: newEpisodeCount,
          status: newStatus
        })
        .eq("id", id);
      
      if (error) throw error;
      
      // Update local state
      setShows(
        shows.map((show) => {
          if (show.id === id) {
            const updatedStatus = newEpisodeCount >= show.episodesNeeded ? "ready" : "waiting";
            return {
              ...show,
              currentEpisodes: newEpisodeCount,
              status: updatedStatus,
            };
          }
          return show;
        })
      );
      
    } catch (error: any) {
      toast({
        title: "Error updating show",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleViewDetails = (show: Show) => {
    setSelectedShow(show);
    setIsDetailsOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const filteredShows = shows.filter((show) => {
    if (filter === "all") return true;
    return show.status === filter;
  });
  
  const readyCount = shows.filter(show => 
    show.status === "ready" || show.currentEpisodes >= show.episodesNeeded
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-black sticky top-0 z-10 border-b border-border py-4 px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <TvIcon className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Binge & Tonic</h1>
          </div>
          <div className="flex items-center gap-4">
            <Select value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter Shows" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Shows ({shows.length})</SelectItem>
                  <SelectItem value="ready">Ready to Binge ({readyCount})</SelectItem>
                  <SelectItem value="waiting">Still Waiting ({shows.length - readyCount})</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Sheet open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
              <SheetTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Show
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Add New Show</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <AddShowForm
                    onAddShow={handleAddShow}
                    onCancel={() => setIsAddFormOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="ghost" onClick={handleSignOut} title="Sign Out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-xl">Loading shows...</p>
          </div>
        ) : (
          <ShowList
            shows={filteredShows}
            onUpdateShow={handleUpdateShow}
            onViewDetails={handleViewDetails}
          />
        )}
        <ShowDetails
          show={selectedShow}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
        />
      </main>

      <footer className="border-t border-border py-4 px-6 text-center text-sm text-muted-foreground">
        <p>Binge & Tonic — Never miss a bingeable show again!</p>
      </footer>
    </div>
  );
};

export default Index;
