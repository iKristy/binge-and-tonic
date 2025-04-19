import * as React from "react";
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
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
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
      <DialogContent className="max-w-lg w-[95vw] sm:w-full p-4 sm:p-6 overflow-hidden rounded-lg">
        <DialogHeader className="px-0">
          <DialogTitle className="break-words text-lg sm:text-xl">{show.title}</DialogTitle>
          {show.genre && (
            <DialogDescription className="break-words text-sm sm:text-base">{show.genre}</DialogDescription>
          )}
        </DialogHeader>

        <div className="relative aspect-video rounded-md overflow-hidden">
          <img
            src={show.imageUrl}
            alt={show.title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <CalendarDays className="h-4 w-4 flex-shrink-0" />
            <span className="break-words text-sm sm:text-base truncate">
              {show.releasedEpisodes} / {show.totalEpisodes} episodes released
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isComplete ? "complete" : "inProgress"}>
              {isComplete ? "Complete season" : `${remainingEpisodes} episode${remainingEpisodes !== 1 ? 's' : ''} remaining`}
            </Badge>
          </div>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full ${isComplete ? "bg-primary" : "bg-orange-500"}`}
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
            <span className="text-sm sm:text-base">Season {show.seasonNumber}</span>
          </div>
        )}

        {show.tmdbId && (
          <div className="mt-2 flex items-center gap-2">
            <a 
              href={`https://www.themoviedb.org/tv/${show.tmdbId}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary underline-offset-4 hover:underline hover:text-blue-600 text-sm sm:text-base truncate"
            >
              <ExternalLink className="h-4 w-4 flex-shrink-0" />
              View on TMDb
            </a>
          </div>
        )}

        <DialogFooter>
          <Button 
            variant="outline"
            onClick={handleWatchedToggle}
            className="w-full sm:flex-1"
          >
            {show.watched ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Mark as Unwatched
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Mark as Watched
              </>
            )}
          </Button>
          <Button 
            variant="destructiveOutline" 
            onClick={handleRemove}
            className="w-full sm:flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove from my list
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShowDetails;