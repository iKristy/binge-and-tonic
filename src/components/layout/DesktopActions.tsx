
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

interface DesktopActionsProps {
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

const DesktopActions: React.FC<DesktopActionsProps> = ({
  isAuthenticated,
  isAddFormOpen,
  setIsAddFormOpen,
  onAddShow,
  onSignIn,
  onSignUp,
  onSignOut,
  userMenuOpen,
  setUserMenuOpen,
}) => {
  return (
    <>
      <Sheet open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
        <SheetTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Show
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add New Show</SheetTitle>
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
          variant="ghost" 
          onClick={onSignOut} 
          title="Sign Out"
          className="flex items-center gap-2 hover:bg-red-900/20"
        >
          <LogOut className="h-5 w-5" />
          <span className="sr-only md:not-sr-only md:inline-block">Sign Out</span>
        </Button>
      ) : (
        <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" title="Account">
              <UserRound className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3">
            <div className="flex flex-col space-y-2">
              <h3 className="font-medium mb-2">Join Binge & Tonic</h3>
              <Button 
                onClick={onSignIn} 
                className="w-full justify-start"
              >
                Sign In
              </Button>
              <Button 
                onClick={onSignUp} 
                variant="outline" 
                className="w-full justify-start"
              >
                Create Account
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
};

export default DesktopActions;
