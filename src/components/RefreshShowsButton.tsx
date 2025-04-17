import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

interface RefreshShowsButtonProps {
  onRefreshComplete: () => void;
  user: User | null;
}

const RefreshShowsButton: React.FC<RefreshShowsButtonProps> = ({
  onRefreshComplete,
  user
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You need to log in to refresh show data",
        variant: "destructive",
      });
      return;
    }

    setIsRefreshing(true);
    try {
      // Call the update-shows edge function
      const { data, error } = await supabase.functions.invoke("update-shows", {
        body: { action: "update" }
      });

      if (error) {
        throw new Error(`Error refreshing shows: ${error.message}`);
      }

      toast({
        title: "Shows refreshed",
        description: data?.message || "Your shows have been refreshed with the latest data",
      });
      
      // After successful update, trigger a fresh fetch of shows
      onRefreshComplete();
    } catch (error: any) {
      console.error("Error refreshing shows:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to refresh shows",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isRefreshing || !user}
      aria-label={isRefreshing ? "Refreshing shows..." : "Refresh shows list"}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />
      {isRefreshing ? "Refreshing..." : "Refresh shows"}
    </Button>
  );
};

export default RefreshShowsButton;
