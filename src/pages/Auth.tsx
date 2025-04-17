
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { TvIcon } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Show } from "@/types/Show";

interface LocationState {
  from: Location;
  action?: string;
  show?: Omit<Show, "id" | "status">;
  showId?: string;
  episodeDelta?: number;
}

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get the location state
  const state = location.state as LocationState;
  
  useEffect(() => {
    // If user is already logged in, redirect to the page they came from
    if (user) {
      handlePostLoginActions();
    }
  }, [user]);

  const handlePostLoginActions = async () => {
    if (!user || !state) {
      navigate("/");
      return;
    }
    
    try {
      // Handle post-login actions based on the state
      if (state.action === 'add_show' && state.show) {
        const isComplete = state.show.releasedEpisodes >= state.show.totalEpisodes;
        
        await supabase
          .from("user_shows")
          .insert({
            user_id: user.id,
            tmdb_show_id: state.show.tmdbId || 0,
            title: state.show.title,
            released_episodes: state.show.releasedEpisodes,
            total_episodes: state.show.totalEpisodes,
            status: isComplete ? "complete" : "waiting",
            poster_url: state.show.imageUrl,
            season_number: state.show.seasonNumber
          });
          
        toast({
          title: "Show Added",
          description: `${state.show.title} has been added to your list.`
        });
      } 
      else if (state.action === 'update_show' && state.showId && state.episodeDelta) {
        // First we need to get the show details
        const { data } = await supabase
          .from("user_shows")
          .select("*")
          .eq("id", state.showId)
          .single();
          
        if (data) {
          const newEpisodeCount = Math.max(0, data.released_episodes + state.episodeDelta);
          const newStatus = newEpisodeCount >= data.total_episodes ? "complete" : "waiting";
          
          await supabase
            .from("user_shows")
            .update({
              released_episodes: newEpisodeCount,
              status: newStatus
            })
            .eq("id", state.showId);
            
          toast({
            title: "Show Updated",
            description: `Episode count updated successfully.`
          });
        }
      }
      
      // Navigate to the page they came from
      navigate(state.from?.pathname || "/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created!",
        description: "Please check your email for verification instructions."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during sign up.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // The redirect will be handled by the useEffect
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during sign in.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <TvIcon className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Binge & Tonic</CardTitle>
          <CardDescription>
            {state?.action ? 'Sign in to save your changes' : 'Sign in to track your favorite shows'}
          </CardDescription>
        </CardHeader>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4 mx-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signin">Email</Label>
                  <Input 
                    id="email-signin" 
                    type="email" 
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signin">Password</Label>
                  <Input 
                    id="password-signin" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  type="button" 
                  onClick={() => navigate("/")}
                >
                  Cancel
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input 
                    id="email-signup" 
                    type="email" 
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <Input 
                    id="password-signup" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? "Signing up..." : "Sign Up"}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  type="button" 
                  onClick={() => navigate("/")}
                >
                  Cancel
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
