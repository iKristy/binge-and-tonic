import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

/**
 * Kicks off a one-off batch refresh of the user's shows shortly after load.
 * The refresh pulls fresh TMDB data and, server-side, moves any show back to
 * the unwatched list when new content lands or a new season is newly announced.
 * Running it automatically means those auto-unwatch changes surface in the
 * background, without the user having to open each show or hit "Refresh shows".
 */
export function useBackgroundRefresh(user: User | null, onComplete: () => void) {
  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;
    // Only run once per signed-in user (survives re-renders, re-runs on login).
    if (lastUserId.current === user.id) return;
    lastUserId.current = user.id;

    let cancelled = false;
    (async () => {
      try {
        const { error } = await supabase.functions.invoke("update-shows", {
          body: { action: "update" },
        });
        if (error) throw error;
        if (!cancelled) onComplete();
      } catch (err) {
        // Background refresh is best-effort; never surface errors to the user.
        console.error("Background show refresh failed:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, onComplete]);
}
