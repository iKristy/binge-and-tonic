
import React from "react";
import { Show } from "@/types/Show";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Film } from "lucide-react";

interface ShowDetailsProps {
  show: Show | null;
  isOpen: boolean;
  onClose: () => void;
}

const ShowDetails: React.FC<ShowDetailsProps> = ({ show, isOpen, onClose }) => {
  if (!show) return null;

  const isReady = show.status === "ready" || show.currentEpisodes >= show.episodesNeeded;

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
              {show.currentEpisodes} / {show.episodesNeeded} episodes
            </span>
          </div>
          <Badge className={isReady ? "bg-green-500" : "bg-primary"}>
            {isReady ? "Ready to Binge!" : "Still Collecting"}
          </Badge>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full ${isReady ? "bg-green-500" : "bg-primary"}`}
            style={{
              width: `${Math.min(
                100,
                (show.currentEpisodes / show.episodesNeeded) * 100
              )}%`,
            }}
          />
        </div>

        {show.description && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">{show.description}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShowDetails;
