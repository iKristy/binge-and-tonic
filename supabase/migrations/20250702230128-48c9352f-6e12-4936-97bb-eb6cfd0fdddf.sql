
-- Update the cron job schedule from every 6 hours to every 24 hours (daily at midnight)
SELECT cron.unschedule('auto-update-shows');

SELECT cron.schedule(
  'auto-update-shows',
  '0 0 * * *', -- Every day at midnight (00:00)
  $$
  SELECT
    net.http_post(
        url:='https://rnjersjdfhalvzdmoqmr.supabase.co/functions/v1/update-shows',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuamVyc2pkZmhhbHZ6ZG1vcW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NDQ2OTgsImV4cCI6MjA2MDQyMDY5OH0.zr8cShSpb9T55LC2Y40_-Mbu5FTNdHXZEJyZ1lQxDN0"}'::jsonb,
        body:='{"action": "scheduled_update"}'::jsonb
    ) as request_id;
  $$
);
