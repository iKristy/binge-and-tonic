import React from "react";
import { LogOut, PlusCircle, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import AddShowForm from "@/components/AddShowForm";

interface MobileActionsProps {
  isAuthenticated: boolean;
  isAddFormOpen: boolean;
  setIsAddFormOpen: (isOpen: boolean) => void;
  onAddShow: (show: any) => void;
  onSignOut: () => Promise<void>;
  onSignIn: () => void;
  onSignUp: () => void;
  userMenuOpen: boolean;
  setUserMenuOpen: (open: boolean) => void;
}

const MobileActions: React.FC<MobileActionsProps> = ({
  isAuthenticated,
  isAddFormOpen,
  setIsAddFormOpen,
  onAddShow,
  onSignOut,
  onSignIn,
  onSignUp,
  userMenuOpen,
  setUserMenuOpen,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Sheet open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
        <SheetTrigger asChild>
          <Button size="icon" aria-label="Add new show">
            <PlusCircle className="h-5 w-5" aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add new show</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <AddShowForm
              onAddShow={onAddShow}
              onCancel={() => setIsAddFormOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {isAuthenticated ? (
        <Button 
          variant="outline" 
          onClick={onSignOut} 
          size="icon"
          aria-label="Sign out"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
        </Button>
      ) : (
        <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Account menu">
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3">
            <div className="flex flex-col space-y-2">
              <h3 className="font-medium mb-2">Join Binge & Tonic</h3>
              <Button 
                onClick={onSignIn} 
                variant="outline"
                className="w-full justify-start"
              >
                Sign in
              </Button>
              <Button 
                onClick={onSignUp} 
                variant="outline" 
                className="w-full justify-start"
              >
                Create account
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default MobileActions;
