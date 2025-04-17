
import { useState } from "react";
import { Show } from "@/types/Show";

export function useShowDetails() {
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleViewDetails = (show: Show) => {
    setSelectedShow(show);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
  };

  return {
    selectedShow,
    isDetailsOpen,
    handleViewDetails,
    handleCloseDetails
  };
}
