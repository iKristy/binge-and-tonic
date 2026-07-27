-- Track the TMDB series-level status (e.g. "Returning Series", "Ended",
-- "Canceled") so the app can distinguish fully finished series from shows
-- whose current season simply has all episodes aired.
ALTER TABLE shows
ADD COLUMN IF NOT EXISTS series_status text DEFAULT NULL;
