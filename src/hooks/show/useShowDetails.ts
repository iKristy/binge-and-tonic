import { useState, useEffect, useRef } from "react";
import { Show } from "@/types/Show";
import { useShowRefresh } from "@/hooks/show/useShowRefresh";

export function useShowDetails(
  onRemoveShow?: (showId: string) => Promise<boolean>,
  onWatchedToggle?: (showId: string) => Promise<boolean>,
  onShowDataUpdated?: () => void
) {
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { refreshShow, isRefreshing } = useShowRefresh();
  const savedScrollY = useRef<number | null>(null);

  // Radix Dialog (via react-remove-scroll) locks body scroll when it opens,
  // which can reset window.scrollY to 0. Snapshot the scroll position on open
  // and restore it after the lock is applied / released.
  useEffect(() => {
    if (!isDetailsOpen) return;
    const y = savedScrollY.current;
    if (y == null) return;

    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      window.scrollTo(0, y);
      raf2 = requestAnimationFrame(() => window.scrollTo(0, y));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      if (y != null) window.scrollTo(0, y);
      savedScrollY.current = null;
    };
  }, [isDetailsOpen]);

  const applyRefreshed = (current: Show, refreshed: { seasonNumber: number; releasedEpisodes: number; totalEpisodes: number; }) => {
    const updated: Show = {
      ...current,
      seasonNumber: refreshed.seasonNumber,
      releasedEpisodes: refreshed.releasedEpisodes,
      totalEpisodes: refreshed.totalEpisodes,
      status: refreshed.releasedEpisodes >= refreshed.totalEpisodes ? "complete" : "waiting",
    };
    setSelectedShow(updated);
    onShowDataUpdated?.();
  };

  const handleViewDetails = (show: Show) => {
    savedScrollY.current = window.scrollY;
    setSelectedShow(show);
    setIsDetailsOpen(true);
    // Auto-refresh in the background so users always see fresh counts.
    if (show.tmdbId) {
      refreshShow(show.tmdbId, { silent: true }).then((refreshed) => {
        if (refreshed) applyRefreshed(show, refreshed);
      });
    }
  };

  const handleManualRefresh = async () => {
    if (!selectedShow?.tmdbId) return;
    const refreshed = await refreshShow(selectedShow.tmdbId);
    if (refreshed) applyRefreshed(selectedShow, refreshed);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
  };

  const handleRemoveShow = async (showId: string) => {
    if (onRemoveShow) {
      await onRemoveShow(showId);
    }
  };

  const handleWatchedToggle = async (showId: string) => {
    if (onWatchedToggle) {
      const success = await onWatchedToggle(showId);
      if (success && selectedShow) {
        setSelectedShow({
          ...selectedShow,
          watched: !selectedShow.watched
        });
      }
    }
  };

  return {
    selectedShow,
    isDetailsOpen,
    handleViewDetails,
    handleCloseDetails,
    handleRemoveShow,
    handleWatchedToggle,
    handleManualRefresh,
    isRefreshing,
  };
}
