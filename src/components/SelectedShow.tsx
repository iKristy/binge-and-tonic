
import React, { useEffect, useState } from "react";
import { TMDbShow, TMDbEpisode, getImageUrl, getSeasonDetails } from "@/services/tmdbApi";

interface SelectedShowProps {
  show: TMDbShow;
  isLoading: boolean;
}

const SelectedShow: React.FC<SelectedShowProps> = ({ show, isLoading }) => {
  const [episodes, setEpisodes] = useState<TMDbEpisode[]>([]);
  const [episodeLoading, setEpisodeLoading] = useState(false);
  
  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!show || !show.seasons || show.seasons.length === 0) return;
      
      try {
        setEpisodeLoading(true);
        // Get the latest season
        const latestSeason = show.seasons.sort((a, b) => b.season_number - a.season_number)[0];
        if (latestSeason) {
          const seasonDetails = await getSeasonDetails(show.id, latestSeason.season_number);
          if (seasonDetails?.episodes) {
            setEpisodes(seasonDetails.episodes);
          }
        }
      } catch (error) {
        console.error("Error fetching episodes:", error);
      } finally {
        setEpisodeLoading(false);
      }
    };
    
    fetchEpisodes();
  }, [show]);
  
  // Calculate released episodes based on air dates
  const today = new Date();
  const releasedEpisodes = episodes.filter(ep => {
    if (!ep.air_date) return false;
    const airDate = new Date(ep.air_date);
    return airDate <= today;
  }).length;
  
  // Find the latest aired and next upcoming episode
  const latestAired = episodes
    .filter(ep => new Date(ep.air_date) <= today)
    .sort((a, b) => new Date(b.air_date).getTime() - new Date(a.air_date).getTime())[0];
    
  const nextAiring = episodes
    .filter(ep => new Date(ep.air_date) > today)
    .sort((a, b) => new Date(a.air_date).getTime() - new Date(b.air_date).getTime())[0];

  return (
    <div className="flex gap-4 p-3 bg-primary rounded-md">
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
        
        {isLoading || episodeLoading ? (
          <p className="text-sm mt-1">Loading show details...</p>
        ) : show.seasons ? (
          <div className="text-sm mt-1">
            <p>Latest: Season {show.seasons.sort((a, b) => b.season_number - a.season_number)[0]?.season_number}</p>
            
            {episodes.length > 0 && (
              <>
                <p className="text-xs mt-1">
                  {releasedEpisodes} of {episodes.length} episodes released
                </p>
                
                {latestAired && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Latest episode: E{latestAired.episode_number} aired {new Date(latestAired.air_date).toLocaleDateString()}
                  </p>
                )}
                
                {nextAiring && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Next episode: E{nextAiring.episode_number} on {new Date(nextAiring.air_date).toLocaleDateString()}
                  </p>
                )}
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SelectedShow;
