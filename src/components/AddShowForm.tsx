import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Show } from "@/types/Show";
import { searchShows, TMDbShow, getImageUrl } from "@/services/tmdbApi";
import ShowSearchResults from "./ShowSearchResults";
import { Search, X } from "lucide-react"; 

interface AddShowFormProps {
  onAddShow: (show: Omit<Show, "id" | "status">) => void;
  onCancel: () => void;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  imageUrl: z.string().url("Please enter a valid URL").or(z.string().length(0)),
  currentEpisodes: z.coerce.number().int().min(0, "Must be at least 0"),
  episodesNeeded: z.coerce.number().int().min(1, "Must be at least 1"),
  description: z.string().optional(),
  genre: z.string().optional(),
  tmdbId: z.number().optional(),
});

const AddShowForm: React.FC<AddShowFormProps> = ({ onAddShow, onCancel }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDbShow[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedShow, setSelectedShow] = useState<TMDbShow | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      imageUrl: "",
      currentEpisodes: 0,
      episodesNeeded: 1,
      description: "",
      genre: "",
      tmdbId: undefined,
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

  const handleShowSelect = (show: TMDbShow) => {
    setSelectedShow(show);
    
    const genres = show.genres?.map(g => g.name).join(", ") || "";
    
    form.setValue("title", show.name);
    form.setValue("imageUrl", getImageUrl(show.poster_path));
    form.setValue("description", show.overview);
    form.setValue("genre", genres);
    form.setValue("episodesNeeded", show.number_of_episodes || 1);
    form.setValue("tmdbId", show.id);
    
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSearchClear = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onAddShow({
      title: values.title,
      imageUrl: values.imageUrl || "/placeholder.svg",
      currentEpisodes: values.currentEpisodes,
      episodesNeeded: values.episodesNeeded,
      description: values.description,
      genre: values.genre,
      tmdbId: values.tmdbId,
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
          <div>
            <h3 className="font-medium">{selectedShow.name}</h3>
            <p className="text-sm text-muted-foreground">
              {selectedShow.first_air_date?.split('-')[0] || 'Unknown year'}
              {selectedShow.number_of_seasons && ` • ${selectedShow.number_of_seasons} season${selectedShow.number_of_seasons !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...form.register("tmdbId", { valueAsNumber: true })} />
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Show Title</FormLabel>
                <FormControl>
                  <Input placeholder="Stranger Things" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Poster Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/poster.jpg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="currentEpisodes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Episodes</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="episodesNeeded"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Episodes to Binge</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="genre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Genre</FormLabel>
                <FormControl>
                  <Input placeholder="Drama, Sci-Fi, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="A brief description of the show" 
                    className="resize-none"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Add Show</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddShowForm;
