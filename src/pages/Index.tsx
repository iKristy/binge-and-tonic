import React from "react";
import { useLocation } from "react-router-dom";
import ShowList from "@/components/ShowList";
import ShowDetails from "@/components/ShowDetails";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/components/AuthProvider";
import { useShowsData } from "@/hooks/useShowsData";
import { useShowDetails } from "@/hooks/show/useShowDetails";
import { useAddShowState } from "@/hooks/show/useAddShowState";
const Index: React.FC = () => {
  const {
    user
  } = useAuth();
  const location = useLocation();
  const {
    filteredShows,
    isLoading,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    addShow,
    removeShow,
    completeCount,
    waitingCount,
    totalCount,
    refreshShows,
    toggleWatched
  } = useShowsData(user);
  const {
    selectedShow,
    isDetailsOpen,
    handleViewDetails,
    handleCloseDetails,
    handleRemoveShow,
    handleWatchedToggle
  } = useShowDetails(removeShow, toggleWatched);
  const {
    isAddFormOpen,
    setIsAddFormOpen,
    handleAddShow
  } = useAddShowState(addShow);
  const watchedShows = filteredShows.filter(show => show.watched);
  const unwatchedShows = filteredShows.filter(show => !show.watched);
  return <div className="min-h-screen bg-background">
      <Header filter={filter} onFilterChange={setFilter} sortBy={sortBy} onSortChange={setSortBy} onAddShow={handleAddShow} isAddFormOpen={isAddFormOpen} setIsAddFormOpen={setIsAddFormOpen} showCounts={{
      total: totalCount,
      complete: completeCount,
      waiting: waitingCount
    }} />

      <main className="mx-auto max-w-7xl p-6 space-y-8">
        {isLoading ? <div className="flex flex-col items-center justify-center py-12">
            <p className="text-xl">Loading shows...</p>
          </div> : <>
            <section>
              <h2 className="text-2xl text-muted-foreground font-semibold mb-4">My shows</h2>
              <ShowList shows={unwatchedShows} onViewDetails={handleViewDetails} />
            </section>

            {watchedShows.length > 0 && <section>
                <h2 className="text-2xl text-muted-foreground font-semibold mb-4">Watched</h2>
                <ShowList shows={watchedShows} onViewDetails={handleViewDetails} />
              </section>}
          </>}
        <ShowDetails show={selectedShow} isOpen={isDetailsOpen} onClose={handleCloseDetails} onRemove={handleRemoveShow} onWatchedToggle={handleWatchedToggle} />
      </main>

      <Footer />
    </div>;
};
export default Index;