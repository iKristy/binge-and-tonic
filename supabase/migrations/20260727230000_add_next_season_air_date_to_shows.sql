-- Track the air date of the first episode of an upcoming (announced but not
-- yet aired) season. Populated from TMDB's next_episode_to_air when it belongs
-- to a season newer than the one we currently track. This lets the app show a
-- "New season" badge only during the pre-release window and hide it once the
-- new season's episodes actually start airing.
ALTER TABLE shows
ADD COLUMN IF NOT EXISTS next_season_air_date date DEFAULT NULL;
