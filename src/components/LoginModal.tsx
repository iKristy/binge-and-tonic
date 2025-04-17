
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  showData?: any;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, showData }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    // Navigate to auth page and pass the current path and show data
    // but NOT the entire location object
    navigate("/auth", { 
      state: { 
        from: location.pathname,
        action: "add_show",
        show: showData
      } 
    });
  };

  const handleSignup = () => {
    // Navigate to auth page with signup tab active
    navigate("/auth", { 
      state: { 
        from: location.pathname,
        action: "add_show",
        show: showData,
        initialTab: "signup"
      } 
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Authentication Required</DialogTitle>
          <DialogDescription>
            You need to be logged in to add shows to your watchlist.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p>Sign in to track your shows and receive updates when new episodes are released.</p>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleSignup} className="flex-1">
            <UserPlus className="mr-2 h-4 w-4" />
            Sign Up
          </Button>
          <Button onClick={handleLogin} className="flex-1">
            <LogIn className="mr-2 h-4 w-4" />
            Log In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
