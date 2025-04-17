
import React from "react";
import { Show } from "@/types/Show";
import ShowCard from "./ShowCard";

interface ShowListProps {
  shows: Show[];
  onViewDetails: (show: Show) => void;
}

const ShowList: React.FC<ShowListProps> = ({
  shows,
  onViewDetails,
}) => {
  if (shows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-xl font-semibold">No shows yet</p>
        <p className="text-muted-foreground">Add some shows to start tracking!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {shows.map((show) => (
        <ShowCard
          key={show.id}
          show={show}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default ShowList;
