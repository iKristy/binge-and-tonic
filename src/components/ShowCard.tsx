import * as React from "react";
import { Show } from "@/types/Show";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarDays, Info } from "lucide-react";
import { morphToDialog } from "@/lib/viewTransition";
import { usePrefetchLatestEpisode } from "@/hooks/show/useLatestEpisode";

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
  const progressPercent = show.totalEpisodes > 0
    ? Math.min(100, (show.releasedEpisodes / show.totalEpisodes) * 100)
    : 0;
  const prefetchLatestEpisode = usePrefetchLatestEpisode();
  const prefetch = () => prefetchLatestEpisode(show.tmdbId, show.seasonNumber);
  const openDetails = (el: HTMLElement | null) => {
    morphToDialog(el, () => onViewDetails(show));
  };
  const handleCardClick = (e: React.MouseEvent<HTMLElement>) => {
    openDetails(e.currentTarget);
  };
  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDetails(e.currentTarget);
    }
  };
  return <Card data-show-card={show.id} className={`group relative aspect-[2/3] w-full overflow-hidden transition-all hover:shadow-xl hover:border-gray-700 cursor-pointer ${show.watched ? 'opacity-50' : ''}`} onClick={handleCardClick} onKeyDown={handleCardKeyDown} onMouseEnter={prefetch} onFocus={prefetch} role="button" tabIndex={0} aria-label={`View details for ${show.title}`}>
      <img src={show.imageUrl || "/placeholder.svg"} alt={show.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <Badge variant={isComplete ? "complete" : "inProgress"} className="absolute top-2 right-2 z-10">
        {isComplete ? "Season completed" : `${remainingEpisodes} episode${remainingEpisodes !== 1 ? 's' : ''} remaining`}
      </Badge>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 backdrop-blur-md"
        style={{
          maskImage: "linear-gradient(to top, black 40%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to top, black 40%, transparent 100%)",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black via-black/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="line-clamp-1 text-xl font-medium text-white">{show.title}</h3>
        {show.seasonNumber && <p className="text-sm mt-2 font-normal text-white/70">Season {show.seasonNumber}</p>}
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
          <div className={`h-full ${isComplete ? "bg-primary" : "bg-orange-500"}`} style={{
          width: `${progressPercent}%`
        }} />
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-white/80">
            <CalendarDays className="h-4 w-4" />
            <span className="font-normal">
              {show.releasedEpisodes} / {show.totalEpisodes} released
            </span>
          </div>
          <Button variant="outline" onClick={e => {
          e.stopPropagation();
          openDetails(e.currentTarget.closest<HTMLElement>("[data-show-card]"));
        }} aria-label={`View details for ${show.title}`}>
            <Info className="h-4 w-4 mr-1" aria-hidden="true" /> Details
          </Button>
        </div>
      </div>
    </Card>;
};

export default React.memo(ShowCard);