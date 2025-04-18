import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { useAuth } from "@/components/AuthProvider";
import { FilterType } from "@/hooks/show/useShowFilter";
import { SortType } from "@/hooks/show/useShowSort";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileActions from "./MobileActions";
import DesktopActions from "./DesktopActions";
import FilterControls from "./FilterControls";

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
  const isMobile = useIsMobile();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Successfully signed out");
      navigate("/", { replace: true });
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Please try again.");
    }
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
    <header className="bg-background sticky top-0 z-10 border-b border-border py-4">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between mb-4 md:mb-0">
            <Logo />
            
            {isMobile && (
              <MobileActions
                isAuthenticated={!!user}
                isAddFormOpen={isAddFormOpen}
                setIsAddFormOpen={setIsAddFormOpen}
                onAddShow={onAddShow}
                onSignOut={handleSignOut}
                onSignIn={handleSignIn}
                onSignUp={handleSignUp}
                userMenuOpen={userMenuOpen}
                setUserMenuOpen={setUserMenuOpen}
              />
            )}
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <FilterControls
              filter={filter}
              onFilterChange={onFilterChange}
              sortBy={sortBy}
              onSortChange={onSortChange}
              showCounts={showCounts}
            />
            
            {!isMobile && (
              <DesktopActions
                isAuthenticated={!!user}
                isAddFormOpen={isAddFormOpen}
                setIsAddFormOpen={setIsAddFormOpen}
                onAddShow={onAddShow}
                onSignOut={handleSignOut}
                onSignIn={handleSignIn}
                onSignUp={handleSignUp}
                userMenuOpen={userMenuOpen}
                setUserMenuOpen={setUserMenuOpen}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
