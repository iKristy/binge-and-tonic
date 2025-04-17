
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TvIcon, AlertCircle, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get initial tab from location state
  const initialTab = location.state?.initialTab === "signup" ? "signup" : "login";
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Get show data from location state
  const showData = location.state?.show;
  const action = location.state?.action;
  const from = location.state?.from || "/";

  useEffect(() => {
    // If user is already logged in, redirect them
    if (user) {
      if (action === "add_show" && showData) {
        // Navigate back to index but pass the show data
        navigate("/", { state: { action: "add_show", show: showData } });
      } else {
        navigate(from);
      }
    }
  }, [user, navigate, from, action, showData]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLogin = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      toast({
        title: "Login successful",
        description: "You have been logged in successfully.",
      });

      // Will be redirected by the useEffect
    } catch (error: any) {
      console.error("Login error:", error);
      setAuthError(error.message || "Failed to login. Please try again.");
      toast({
        title: "Login failed",
        description: error.message || "Failed to login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSignup = async (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      toast({
        title: "Signup successful",
        description: "Your account has been created. Check your email for confirmation.",
      });

      // Will be redirected by the useEffect if email verification is not required
    } catch (error: any) {
      console.error("Signup error:", error);
      setAuthError(error.message || "Failed to sign up. Please try again.");
      toast({
        title: "Signup failed",
        description: error.message || "Failed to sign up. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-black border-b border-border py-4 px-6">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-2">
            <TvIcon className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Binge & Tonic</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">
              {showData ? "Sign in to add shows" : "Welcome to Binge & Tonic"}
            </CardTitle>
            <CardDescription>
              {showData 
                ? "Sign in or create an account to add shows to your watchlist"
                : "Sign in to your account or create a new one"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {authError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4 mt-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="signup">
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4 mt-4">
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Create a password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing up..." : "Sign Up"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground text-center">
              {activeTab === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => setActiveTab(activeTab === "login" ? "signup" : "login")}
              >
                {activeTab === "login" ? "Sign Up" : "Login"}
              </Button>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default Auth;
