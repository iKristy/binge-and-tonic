
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { Show } from "@/types/Show";

export function useAddShowState(onAddShow: (show: Omit<Show, "id" | "status">) => Promise<boolean>) {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Check if we have show data from Auth page
  useEffect(() => {
    const showData = location.state?.show;
    const action = location.state?.action;
    
    if (action === "add_show" && showData) {
      // Clear the location state to prevent repeated processing
      window.history.replaceState({}, document.title);
      
      // Open the add form dialog
      setIsAddFormOpen(true);
      
      // Handle adding the show after a short delay to ensure components are mounted
      setTimeout(() => {
        handleAddShow(showData);
      }, 100);
    }
  }, [location]);

  const handleAddShow = async (newShow: Omit<Show, "id" | "status">) => {
    // No authentication check, proceed directly with adding the show
    const success = await onAddShow(newShow);
    if (success) {
      setIsAddFormOpen(false);
    }
  };

  return {
    isAddFormOpen,
    setIsAddFormOpen,
    handleAddShow
  };
}
