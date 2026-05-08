import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RefreshedShow {
  id: number;
  title: string;
  seasonNumber: number;
  releasedEpisodes: number;
  totalEpisodes: number;
}

/**
 * Refresh a single show's TMDb data on demand.
 * Returns the freshly fetched values so callers can update local state immediately.
 */
export function useShowRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const refreshShow = useCallback(
    async (tmdbId: number, opts?: { silent?: boolean }): Promise<RefreshedShow | null> => {
      try {
        setIsRefreshing(true);
        const { data, error } = await supabase.functions.invoke("update-shows", {
          body: { tmdbId },
        });
        if (error) throw new Error(error.message);
        if (!opts?.silent) {
          toast({ title: "Show refreshed", description: "Latest data pulled from TMDb." });
        }
        return data?.show ?? null;
      } catch (err: any) {
        if (!opts?.silent) {
          toast({
            title: "Refresh failed",
            description: err.message || "Could not refresh show",
            variant: "destructive",
          });
        }
        return null;
      } finally {
        setIsRefreshing(false);
      }
    },
    [toast]
  );

  return { refreshShow, isRefreshing };
}
