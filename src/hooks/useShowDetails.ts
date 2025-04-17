
import { useState } from "react";
import { Show } from "@/types/Show";

export function useShowDetails(onRemoveShow?: (showId: string) => Promise<boolean>) {
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

  return {
    selectedShow,
    isDetailsOpen,
    handleViewDetails,
    handleCloseDetails,
    handleRemoveShow
  };
}
