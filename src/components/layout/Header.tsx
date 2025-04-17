import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TvIcon, LogOut, PlusCircle, UserRound, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useAuth } from "@/components/AuthProvider";
import { FilterType } from "@/hooks/show/useShowFilter";
import { SortType } from "@/hooks/show/useShowSort";

interface HeaderProps {
  filter: FilterType;
  onFilterChange: (value: FilterType) => void;
  sortBy: SortType;
  onSortChange: (value: SortType) => void;
  onAddShow: (show: any) => void;
  isAddFormOpen: boolean;
  setIsAddFormOpen: (isOpen: boolean) => void;
  showCounts: {
    total: number;
    complete: number;
    waiting: number;
  };
}

const Header: React.FC<HeaderProps> = ({
  filter,
  onFilterChange,
  sortBy,
  onSortChange,
  onAddShow,
  isAddFormOpen,
  setIsAddFormOpen,
  showCounts
}) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
  };
  
  const handleSignIn = () => {
    navigate("/auth", { state: { from: location.pathname } });
    setUserMenuOpen(false);
  };

  const handleSignUp = () => {
    navigate("/auth", { state: { from: location.pathname, initialTab: "signup" } });
    setUserMenuOpen(false);
  };

  return (
    <header className="bg-black sticky top-0 z-10 border-b border-border py-4 px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-2">
          <TvIcon className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Binge & Tonic</h1>
        </div>
        <div className="flex items-center gap-4">
          <Select value={filter} onValueChange={(value) => onFilterChange(value as FilterType)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Shows" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Shows ({showCounts.total})</SelectItem>
                <SelectItem value="complete">Ready to Binge ({showCounts.complete})</SelectItem>
                <SelectItem value="waiting">Waiting for Episodes ({showCounts.waiting})</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortType)}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <SortDesc className="h-4 w-4" />
                <SelectValue placeholder="Sort By" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
                <SelectItem value="status">By Show Status</SelectItem>
                <SelectItem value="releaseDate">By Release Date</SelectItem>
                <SelectItem value="dateAdded">By Date Added</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
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
          
          {user ? (
            <Button 
              variant="ghost" 
              onClick={handleSignOut} 
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
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
                    onClick={handleSignIn} 
                    className="w-full justify-start"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={handleSignUp} 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    Create Account
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
