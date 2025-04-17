
import { useState } from "react";
import { Show } from "@/types/Show";

export function useShowDetails(
  onRemoveShow?: (showId: string) => Promise<boolean>,
  onWatchedToggle?: (showId: string) => Promise<boolean>
) {
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleViewDetails = (show: Show) => {
    setSelectedShow(show);
    setIsDetailsOpen(true);
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
    handleWatchedToggle
  };
}
