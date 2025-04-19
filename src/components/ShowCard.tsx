import * as React from "react";
import { Show } from "@/types/Show";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Info } from "lucide-react";

interface ShowCardProps {
  show: Show;
  onViewDetails: (show: Show) => void;
}

const ShowCard: React.FC<ShowCardProps> = ({
  show,
  onViewDetails
}) => {
  const isComplete = show.status === "complete" || show.releasedEpisodes >= show.totalEpisodes;
  const remainingEpisodes = Math.max(0, show.totalEpisodes - show.releasedEpisodes);
  const handleCardClick = () => {
    onViewDetails(show);
  };
  return <Card className={`w-full overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl hover:border-gray-700 cursor-pointer ${show.watched ? 'opacity-50' : ''}`} onClick={handleCardClick} role="button" tabIndex={0} aria-label={`View details for ${show.title}`}>
      <div className="relative aspect-video">
        <img src={show.imageUrl || "/placeholder.svg"} alt={show.title} className="h-full w-full object-cover" />
        <Badge variant={isComplete ? "complete" : "inProgress"} className="absolute top-2 right-2">
          {isComplete ? "Season completed" : `${remainingEpisodes} episode${remainingEpisodes !== 1 ? 's' : ''} remaining`}
        </Badge>
      </div>
      <CardHeader className="p-4">
        <CardTitle className="line-clamp-1 text-xl font-medium">{show.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span className="font-normal">
            {show.releasedEpisodes} / {show.totalEpisodes} episodes released
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div className={`h-full ${isComplete ? "bg-primary" : "bg-orange-500"}`} style={{
          width: `${Math.min(100, show.releasedEpisodes / show.totalEpisodes * 100)}%`
        }} />
        </div>
        {show.seasonNumber && <p className="text-sm mt-2 font-normal text-muted-foreground">Season {show.seasonNumber}</p>}
      </CardContent>
      <CardFooter className="flex justify-end p-4 pt-0">
        <Button size="sm" variant="outline" onClick={e => {
        e.stopPropagation();
        onViewDetails(show);
      }} aria-label={`View details for ${show.title}`}>
          <Info className="h-4 w-4 mr-1" aria-hidden="true" /> Details
        </Button>
      </CardFooter>
    </Card>;
};

export default ShowCard;