
import React from "react";
import { Show } from "@/types/Show";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Plus, Minus, Info } from "lucide-react";

interface ShowCardProps {
  show: Show;
  onUpdate: (id: string, episodeDelta: number) => void;
  onViewDetails: (show: Show) => void;
}

const ShowCard: React.FC<ShowCardProps> = ({ show, onUpdate, onViewDetails }) => {
  const isReady = show.status === "ready" || show.currentEpisodes >= show.episodesNeeded;

  return (
    <Card className="w-full overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl">
      <div className="relative aspect-video">
        <img
          src={show.imageUrl || "/placeholder.svg"}
          alt={show.title}
          className="h-full w-full object-cover"
        />
        <Badge 
          className={`absolute top-2 right-2 ${
            isReady ? "bg-green-500" : "bg-gray-500"
          }`}
        >
          {isReady ? "Ready to Binge!" : "Still Collecting"}
        </Badge>
      </div>
      <CardHeader className="p-4">
        <CardTitle className="line-clamp-1 text-lg">{show.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>
            {show.currentEpisodes} / {show.episodesNeeded} episodes
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full ${
              isReady ? "bg-green-500" : "bg-primary"
            }`}
            style={{
              width: `${Math.min(
                100,
                (show.currentEpisodes / show.episodesNeeded) * 100
              )}%`,
            }}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-4 pt-0">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdate(show.id, -1)}
            disabled={show.currentEpisodes <= 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdate(show.id, 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => onViewDetails(show)}
        >
          <Info className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ShowCard;
