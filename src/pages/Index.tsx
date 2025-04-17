
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
import { useNavigate } from "react-router-dom";
import { PlusCircle, TvIcon, LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type FilterType = "all" | "complete" | "waiting";

const Index: React.FC = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const handleAddShow = async (newShow: Omit<Show, "id" | "status">) => {
    try {
      const isComplete = newShow.releasedEpisodes >= newShow.totalEpisodes;
      const showData = {
        title: newShow.title,
        total_episodes: newShow.totalEpisodes,
        released_episodes: newShow.releasedEpisodes,
        status: isComplete ? "completed" : "waiting",
        poster_url: newShow.imageUrl,
        tmdb_show_id: newShow.tmdbId || 0,
        season_number: newShow.seasonNumber || 1
      };
      
      // If user is logged in, save to Supabase
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
            status: isComplete ? "complete" : "waiting",
            seasonNumber: data[0].season_number,
            tmdbId: data[0].tmdb_show_id
          };
          
          setShows([newShowWithId, ...shows]);
          localStorage.setItem("shows", JSON.stringify([newShowWithId, ...shows]));
          
          toast({
            title: "Show Added",
            description: `${newShowWithId.title} has been added to your list.`
          });
        }
      } else {
        // If not logged in, prompt for login
        navigate("/auth", { state: { from: location, action: "add_show", show: newShow } });
        return;
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

  const handleViewDetails = (show: Show) => {
    setSelectedShow(show);
    setIsDetailsOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
  };
  
  const handleSignIn = () => {
    navigate("/auth", { state: { from: location } });
  };

  const filteredShows = shows.filter((show) => {
    if (filter === "all") return true;
    if (filter === "complete") return show.status === "complete" || show.releasedEpisodes >= show.totalEpisodes;
    return show.status === "waiting" && show.releasedEpisodes < show.totalEpisodes;
  });
  
  const completeCount = shows.filter(show => 
    show.status === "complete" || show.releasedEpisodes >= show.totalEpisodes
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
                  <SelectItem value="complete">Ready to Binge ({completeCount})</SelectItem>
                  <SelectItem value="waiting">Waiting for Episodes ({shows.length - completeCount})</SelectItem>
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
            {user ? (
              <Button variant="ghost" onClick={handleSignOut} title="Sign Out">
                <LogOut className="h-5 w-5" />
              </Button>
            ) : (
              <Button variant="ghost" onClick={handleSignIn} title="Sign In">
                <LogIn className="h-5 w-5" />
              </Button>
            )}
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
