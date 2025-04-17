import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import AuthHeader from "@/components/auth/AuthHeader";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const initialTab = location.state?.initialTab === "signup" ? "signup" : "login";
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const showData = location.state?.show;
  const action = location.state?.action;
  const from = location.state?.from || "/";

  useEffect(() => {
    if (user) {
      if (action === "add_show" && showData) {
        navigate("/", { state: { action: "add_show", show: showData } });
      } else {
        navigate(from);
      }
    }
  }, [user, navigate, from, action, showData]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AuthHeader />

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
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <LoginForm setIsLoading={setIsLoading} setAuthError={setAuthError} />
              </TabsContent>

              <TabsContent value="signup">
                <SignupForm setIsLoading={setIsLoading} setAuthError={setAuthError} />
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
                {activeTab === "login" ? "Sign up" : "Login"}
              </Button>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default Auth;
