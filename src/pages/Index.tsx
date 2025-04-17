
import React from "react";
import { useLocation } from "react-router-dom";
import ShowList from "@/components/ShowList";
import ShowDetails from "@/components/ShowDetails";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/components/AuthProvider";
import { useShowsData } from "@/hooks/useShowsData";
import { useShowDetails } from "@/hooks/useShowDetails";
import { useAddShowState } from "@/hooks/useAddShowState";

const Index: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const { 
    filteredShows, 
    isLoading, 
    filter, 
    setFilter,
    addShow,
    removeShow,
    completeCount,
    waitingCount,
    totalCount
  } = useShowsData(user);
  
  const {
    selectedShow,
    isDetailsOpen,
    handleViewDetails,
    handleCloseDetails,
    handleRemoveShow
  } = useShowDetails(removeShow);
  
  const {
    isAddFormOpen,
    setIsAddFormOpen,
    handleAddShow
  } = useAddShowState(addShow);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        filter={filter}
        onFilterChange={setFilter}
        onAddShow={handleAddShow}
        isAddFormOpen={isAddFormOpen}
        setIsAddFormOpen={setIsAddFormOpen}
        showCounts={{
          total: totalCount,
          complete: completeCount,
          waiting: waitingCount
        }}
      />

      <main className="mx-auto max-w-7xl p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-xl">Loading shows...</p>
          </div>
        ) : (
          <ShowList
            shows={filteredShows}
            onViewDetails={handleViewDetails}
          />
        )}
        <ShowDetails
          show={selectedShow}
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
          onRemove={handleRemoveShow}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
