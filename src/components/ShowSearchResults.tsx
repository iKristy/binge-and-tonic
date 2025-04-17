
import React from "react";
import { TMDbShow } from "@/services/tmdbApi";
import { getImageUrl } from "@/services/tmdbApi";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle } from "lucide-react";

interface ShowSearchResultsProps {
  results: TMDbShow[];
  onSelectShow: (show: TMDbShow) => void;
  isLoading: boolean;
  error?: string;
}

const ShowSearchResults: React.FC<ShowSearchResultsProps> = ({ 
  results, 
  onSelectShow, 
  isLoading,
  error
}) => {
  if (isLoading) {
    return (
      <div className="py-4 text-center">
        <p>Searching for shows...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 text-center text-destructive">
        <div className="flex items-center justify-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-muted-foreground">No shows found</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-72 rounded-md border">
      <div className="p-4 grid gap-2">
        {results.map((show) => (
          <Card 
            key={show.id} 
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => onSelectShow(show)}
          >
            <CardContent className="p-3 flex gap-3 items-center">
              <div className="w-12 h-16 flex-shrink-0 overflow-hidden rounded-sm">
                {show.poster_path ? (
                  <img 
                    src={getImageUrl(show.poster_path, "w92")} 
                    alt={show.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                    No img
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium line-clamp-1">{show.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {show.first_air_date?.split('-')[0] || 'Unknown year'}
                  {show.number_of_seasons && ` • ${show.number_of_seasons} season${show.number_of_seasons !== 1 ? 's' : ''}`}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ShowSearchResults;
