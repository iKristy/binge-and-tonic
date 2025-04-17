import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Show } from "@/types/Show";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const migrateLocalShows = async (userId: string) => {
    try {
      const localShows = localStorage.getItem("shows");
      if (!localShows) return;

      const shows: Show[] = JSON.parse(localShows);
      if (shows.length === 0) return;

      console.log("Migrating local shows to database:", shows);

      for (const show of shows) {
        // First, check if the show exists in the shows table
        let showId: number;
        const { data: existingShow, error: findError } = await supabase
          .from("shows")
          .select("id")
          .eq("tmdb_id", show.tmdbId)
          .single();

        if (findError && findError.code !== "PGRST116") { // Not found error is expected
          console.error("Error finding show:", findError);
          continue;
        }

        // If the show doesn't exist, insert it
        if (!existingShow) {
          const { data: insertedShow, error: insertShowError } = await supabase
            .from("shows")
            .insert({
              tmdb_id: show.tmdbId,
              title: show.title,
              poster_url: show.imageUrl,
              total_episodes: show.totalEpisodes,
              released_episodes: show.releasedEpisodes,
              season_number: show.seasonNumber
            })
            .select("id")
            .single();

          if (insertShowError) {
            console.error("Error inserting show:", insertShowError);
            continue;
          }

          showId = insertedShow.id;
        } else {
          showId = existingShow.id;
        }

        // Create the user-show relationship
        const { error: relationError } = await supabase
          .from("user_show_relations")
          .insert({
            user_id: userId,
            show_id: showId,
            status: show.status === "complete" ? "completed" : "watching"
          })
          .select()
          .single();

        if (relationError && relationError.code !== "23505") { // Ignore unique constraint violations
          console.error("Error creating show relation:", relationError);
        }
      }

      // Clear local storage after successful migration
      localStorage.removeItem("shows");
    } catch (error) {
      console.error("Error migrating shows:", error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // If user just logged in or signed up, migrate their local shows
        if (
          (event === "SIGNED_IN" || event === "USER_UPDATED") && 
          currentSession?.user
        ) {
          // Use setTimeout to prevent auth state deadlock
          setTimeout(() => {
            migrateLocalShows(currentSession.user!.id);
          }, 0);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Existing session:", currentSession ? "found" : "not found");
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log("Signing out...");
    try {
      await supabase.auth.signOut();
      console.log("Sign out API call completed");
    } catch (error) {
      console.error("Error during signOut:", error);
    } finally {
      setUser(null);
      setSession(null);
      localStorage.removeItem("sb-rnjersjdfhalvzdmoqmr-auth-token");
      console.log("Sign out local cleanup completed");
    }
  };

  const value = {
    user,
    session,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
