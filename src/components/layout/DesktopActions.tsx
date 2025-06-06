import React from "react";
import { LogOut, PlusCircle, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AddShowForm from "@/components/AddShowForm";
import { useIsTablet } from "@/hooks/use-tablet";

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
  setUserMenuOpen
}) => {
  const isTablet = useIsTablet();

  return (
    <div className="flex items-center gap-2">
      <Sheet open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
        <SheetTrigger asChild>
          <Button aria-label="Add new show">
            <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />
            Add show
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add new show</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <AddShowForm onAddShow={onAddShow} onCancel={() => setIsAddFormOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {isAuthenticated ? (
        <Button 
          variant="outline" 
          onClick={onSignOut} 
          aria-label="Sign out" 
          className="flex items-center gap-2 min-w-[40px]"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <span className={`${isTablet ? 'hidden' : 'inline-block'} truncate`}>Sign out</span>
        </Button>
      ) : (
        <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" aria-label="Account menu">
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3">
            <div className="flex flex-col space-y-2">
              <h3 className="font-medium mb-2">Join Binge & Tonic</h3>
              <Button onClick={onSignIn} variant="outline" className="w-full justify-start">
                Sign in
              </Button>
              <Button onClick={onSignUp} variant="outline" className="w-full justify-start">
                Create account
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default DesktopActions;