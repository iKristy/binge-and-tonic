
import React from "react";
import { TMDbShow, getImageUrl } from "@/services/tmdbApi";

interface SelectedShowProps {
  show: TMDbShow;
  isLoading: boolean;
}

const SelectedShow: React.FC<SelectedShowProps> = ({ show, isLoading }) => {
  return (
    <div className="flex gap-4 p-3 bg-accent/30 rounded-md">
      <div className="w-20 flex-shrink-0">
        <img 
          src={getImageUrl(show.poster_path, "w154")} 
          alt={show.name}
          className="rounded-sm object-cover w-full h-auto"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{show.name}</h3>
        <p className="text-sm text-muted-foreground">
          {show.first_air_date?.split('-')[0] || 'Unknown year'}
          {show.number_of_seasons && ` • ${show.number_of_seasons} season${show.number_of_seasons !== 1 ? 's' : ''}`}
        </p>
        {isLoading ? (
          <p className="text-sm mt-1">Loading show details...</p>
        ) : show.seasons ? (
          <p className="text-sm mt-1">Latest: Season {show.seasons.sort((a, b) => b.season_number - a.season_number)[0]?.season_number}</p>
        ) : null}
      </div>
    </div>
  );
};

export default SelectedShow;
