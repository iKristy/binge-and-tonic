
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Show } from "@/types/Show";
import { searchShows, TMDbShow, getImageUrl, getShowDetails } from "@/services/tmdbApi";
import ShowSearchResults from "./ShowSearchResults";
import { Search, X } from "lucide-react"; 

interface AddShowFormProps {
  onAddShow: (show: Omit<Show, "id" | "status">) => void;
  onCancel: () => void;
}

const formSchema = z.object({
  tmdbId: z.number().min(1, "Please select a show"),
});

const AddShowForm: React.FC<AddShowFormProps> = ({ onAddShow, onCancel }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDbShow[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedShow, setSelectedShow] = useState<TMDbShow | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tmdbId: 0,
    },
  });

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setIsSearching(true);
        const results = await searchShows(searchQuery);
        setSearchResults(results.results || []);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const handleShowSelect = async (show: TMDbShow) => {
    setSelectedShow(show);
    form.setValue("tmdbId", show.id);
    
    // Get detailed info about the show
    setIsLoading(true);
    try {
      const details = await getShowDetails(show.id);
      if (details) {
        setSelectedShow({
          ...show,
          ...details
        });
      }
    } catch (error) {
      console.error("Error fetching show details:", error);
    } finally {
      setIsLoading(false);
    }
    
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSearchClear = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedShow) return;

    const latestSeason = selectedShow.seasons?.sort((a, b) => b.season_number - a.season_number)[0];
    const seasonNumber = latestSeason?.season_number || 1;
    const totalEpisodes = latestSeason?.episode_count || selectedShow.number_of_episodes || 0;
    
    // For calculating released episodes, we would ideally need episode air dates
    // As a simplification, we'll assume all episodes are released if the show's last_air_date is more than 
    // the average time it would take for all episodes to air (roughly 1 week per episode)
    const lastAirDate = new Date(selectedShow.last_air_date || selectedShow.first_air_date);
    const today = new Date();
    const timeDiff = today.getTime() - lastAirDate.getTime();
    const daysSinceLastAir = timeDiff / (1000 * 3600 * 24);
    
    // Estimate released episodes based on time since last air date
    // This is a simplified approach and could be improved with actual episode air dates
    let releasedEpisodes = totalEpisodes;
    if (selectedShow.in_production && selectedShow.status === 'Returning Series') {
      // If show is still in production, estimate based on weekly releases
      releasedEpisodes = Math.min(totalEpisodes, Math.ceil(daysSinceLastAir / 7));
    }

    onAddShow({
      title: selectedShow.name,
      imageUrl: selectedShow.poster_path ? getImageUrl(selectedShow.poster_path) : "/placeholder.svg",
      totalEpisodes,
      releasedEpisodes,
      description: selectedShow.overview,
      genre: selectedShow.genres?.map(g => g.name).join(", "),
      tmdbId: selectedShow.id,
      seasonNumber
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
          <Search className="ml-2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for TV shows..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {searchQuery && (
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 mr-1"
              onClick={handleSearchClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {(searchResults.length > 0 || isSearching) && (
          <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-md">
            <ShowSearchResults 
              results={searchResults} 
              onSelectShow={handleShowSelect}
              isLoading={isSearching}
            />
          </div>
        )}
      </div>

      {selectedShow && (
        <div className="flex gap-4 p-3 bg-accent/30 rounded-md">
          <div className="w-20 flex-shrink-0">
            <img 
              src={getImageUrl(selectedShow.poster_path, "w154")} 
              alt={selectedShow.name}
              className="rounded-sm object-cover w-full h-auto"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{selectedShow.name}</h3>
            <p className="text-sm text-muted-foreground">
              {selectedShow.first_air_date?.split('-')[0] || 'Unknown year'}
              {selectedShow.number_of_seasons && ` • ${selectedShow.number_of_seasons} season${selectedShow.number_of_seasons !== 1 ? 's' : ''}`}
            </p>
            {isLoading ? (
              <p className="text-sm mt-1">Loading show details...</p>
            ) : selectedShow.seasons ? (
              <p className="text-sm mt-1">Latest: Season {selectedShow.seasons.sort((a, b) => b.season_number - a.season_number)[0]?.season_number}</p>
            ) : null}
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...form.register("tmdbId", { valueAsNumber: true })} />
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedShow || isLoading}
            >
              {isLoading ? "Loading..." : "Add Show"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddShowForm;
