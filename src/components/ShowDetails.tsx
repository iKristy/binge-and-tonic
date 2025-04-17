
import React from "react";
import { Show } from "@/types/Show";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, ExternalLink, Film, Trash2, Eye, EyeOff } from "lucide-react";

interface ShowDetailsProps {
  show: Show | null;
  isOpen: boolean;
  onClose: () => void;
  onRemove?: (showId: string) => void;
  onWatchedToggle?: (showId: string) => void;
}

const ShowDetails: React.FC<ShowDetailsProps> = ({ 
  show, 
  isOpen, 
  onClose, 
  onRemove,
  onWatchedToggle 
}) => {
  if (!show) return null;

  const isComplete = show.status === "complete" || show.releasedEpisodes >= show.totalEpisodes;
  const remainingEpisodes = Math.max(0, show.totalEpisodes - show.releasedEpisodes);

  const handleRemove = () => {
    if (show.id && onRemove) {
      onRemove(show.id);
      onClose();
    }
  };

  const handleWatchedToggle = () => {
    if (show.id && onWatchedToggle) {
      onWatchedToggle(show.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{show.title}</DialogTitle>
          {show.genre && (
            <DialogDescription>{show.genre}</DialogDescription>
          )}
        </DialogHeader>

        <div className="relative aspect-video rounded-md overflow-hidden">
          <img
            src={show.imageUrl}
            alt={show.title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span>
              {show.releasedEpisodes} / {show.totalEpisodes} episodes released
            </span>
          </div>
          <Badge className={isComplete ? "bg-green-500" : "bg-orange-500"}>
            {isComplete ? "Complete Season!" : `${remainingEpisodes} to go`}
          </Badge>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full ${isComplete ? "bg-green-500" : "bg-orange-500"}`}
            style={{
              width: `${Math.min(
                100,
                (show.releasedEpisodes / show.totalEpisodes) * 100
              )}%`,
            }}
          />
        </div>

        {show.seasonNumber && (
          <div className="mt-2 flex items-center gap-2">
            <Film className="h-4 w-4 text-muted-foreground" />
            <span>Season {show.seasonNumber}</span>
          </div>
        )}

        {show.tmdbId && (
          <div className="mt-2 flex items-center gap-2">
            <a 
              href={`https://www.themoviedb.org/tv/${show.tmdbId}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-500 hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              View on TMDb
            </a>
          </div>
        )}

        <DialogFooter className="mt-4 flex flex-row justify-between items-center gap-2">
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleWatchedToggle}
              className="flex gap-2 items-center"
            >
              {show.watched ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Mark as Unwatched
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Mark as Watched
                </>
              )}
            </Button>
          </div>
          <Button 
            variant="destructive" 
            onClick={handleRemove}
            className="flex gap-2 items-center"
          >
            <Trash2 className="h-4 w-4" />
            Remove from my list
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShowDetails;
