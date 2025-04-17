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
import { PlusCircle, TvIcon } from "lucide-react";

const INITIAL_SHOWS: Show[] = [
  {
    id: "1",
    title: "Stranger Things",
    imageUrl: "https://resizing.flixster.com/0xxuABVVuzJDQsS48MvgfrPv9lg=/ems.cHJkLWVtcy1hc3NldHMvdHZzZXJpZXMvUlRUVjI0NTgxMS53ZWJw",
    currentEpisodes: 3,
    episodesNeeded: 8,
    status: "waiting",
    genre: "Sci-Fi, Horror",
    description: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
  },
  {
    id: "2",
    title: "Breaking Bad",
    imageUrl: "https://m.media-amazon.com/images/M/MV5BYmQ4YWMxYjUtNjZmYi00MDQ1LWFjMjMtNjA5ZDdiYjdiODU5XkEyXkFqcGdeQXVyMTMzNDExODE5._V1_.jpg",
    currentEpisodes: 62,
    episodesNeeded: 20,
    status: "ready",
    genre: "Crime, Drama",
    description: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine to secure his family's future.",
  },
  {
    id: "3",
    title: "The Mandalorian",
    imageUrl: "https://lumiere-a.akamaihd.net/v1/images/p_themandalorian_20273_3c4470f6.jpeg",
    currentEpisodes: 6,
    episodesNeeded: 10,
    status: "waiting",
    genre: "Action, Adventure, Sci-Fi",
    description: "The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.",
  },
];

type FilterType = "all" | "ready" | "waiting";

const Index: React.FC = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    const savedShows = localStorage.getItem("binge-shows");
    if (savedShows) {
      setShows(JSON.parse(savedShows));
    } else {
      setShows(INITIAL_SHOWS);
    }
  }, []);

  useEffect(() => {
    if (shows.length > 0) {
      localStorage.setItem("binge-shows", JSON.stringify(shows));
    }
  }, [shows]);

  const handleAddShow = (newShow: Omit<Show, "id" | "status">) => {
    const episodesReady = newShow.currentEpisodes >= newShow.episodesNeeded;
    const show: Show = {
      ...newShow,
      id: uuidv4(),
      status: episodesReady ? "ready" : "waiting",
    };
    
    setShows([...shows, show]);
    setIsAddFormOpen(false);
  };

  const handleUpdateShow = (id: string, episodeDelta: number) => {
    setShows(
      shows.map((show) => {
        if (show.id === id) {
          const newEpisodeCount = Math.max(0, show.currentEpisodes + episodeDelta);
          const newStatus = newEpisodeCount >= show.episodesNeeded ? "ready" : "waiting";
          return {
            ...show,
            currentEpisodes: newEpisodeCount,
            status: newStatus,
          };
        }
        return show;
      })
    );
  };

  const handleViewDetails = (show: Show) => {
    setSelectedShow(show);
    setIsDetailsOpen(true);
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
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <ShowList
          shows={filteredShows}
          onUpdateShow={handleUpdateShow}
          onViewDetails={handleViewDetails}
        />
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
