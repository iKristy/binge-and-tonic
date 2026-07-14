import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

interface RefreshShowsButtonProps {
  onRefreshComplete: () => void;
  user: User | null;
  variant?: "default" | "icon";
}

const RefreshShowsButton: React.FC<RefreshShowsButtonProps> = ({
  onRefreshComplete,
  user,
  variant = "default",
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
      const { data, error } = await supabase.functions.invoke("update-shows", {
        body: { action: "update" },
      });

      if (error) {
        throw new Error(`Error refreshing shows: ${error.message}`);
      }

      toast({
        title: "Shows refreshed",
        description: data?.message || "Your shows have been refreshed with the latest data",
      });

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

  const label = isRefreshing ? "Refreshing shows..." : "Refresh shows";

  if (variant === "icon") {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={handleRefresh}
        disabled={isRefreshing || !user}
        aria-label={label}
        title={label}
      >
        <RefreshCw
          className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
          aria-hidden="true"
        />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleRefresh}
      disabled={isRefreshing || !user}
      className="w-full"
      aria-label={label}
    >
      <RefreshCw
        className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
        aria-hidden="true"
      />
      {isRefreshing ? "Refreshing..." : "Refresh shows"}
    </Button>
  );
};

export default RefreshShowsButton;
