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
      <Badge variant={isComplete ? "complete" : "inProgress"} className="absolute top-1.5 right-1.5 z-10 max-w-[calc(100%-0.75rem)] truncate text-[10px] sm:top-2 sm:right-2 sm:max-w-none sm:text-xs">
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
      <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-4">
        <h3 className="line-clamp-1 text-base font-medium text-white sm:text-lg">{show.title}</h3>
        {show.seasonNumber && <p className="mt-1 text-xs font-normal text-white/70 sm:mt-2 sm:text-sm">Season {show.seasonNumber}</p>}
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/20 sm:mt-2 sm:h-2">
          <div className={`h-full ${isComplete ? "bg-primary" : "bg-orange-500"}`} style={{
          width: `${progressPercent}%`
        }} />
        </div>
        <div className="mt-2 flex items-center justify-between gap-1.5 sm:mt-3 sm:gap-2">
          <div className="flex min-w-0 items-center gap-1 text-xs text-white/80 sm:gap-2 sm:text-sm">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            <span className="truncate font-normal">
              {show.releasedEpisodes} / {show.totalEpisodes} released
            </span>
          </div>
          <Button variant="outline" className="h-7 shrink-0 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm" onClick={e => {
          e.stopPropagation();
          openDetails(e.currentTarget.closest<HTMLElement>("[data-show-card]"));
        }} aria-label={`View details for ${show.title}`}>
            <Info className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" /> Details
          </Button>
        </div>
      </div>
    </Card>;
};

export default React.memo(ShowCard);