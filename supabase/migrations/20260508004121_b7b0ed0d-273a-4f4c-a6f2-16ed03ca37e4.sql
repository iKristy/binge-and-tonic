-- Update the auto-update-shows cron job to run every 2 hours instead of every 12
SELECT cron.unschedule('auto-update-shows');

SELECT cron.schedule(
  'auto-update-shows',
  '0 */2 * * *',
  $$
  SELECT net.http_post(
    url:='https://rnjersjdfhalvzdmoqmr.supabase.co/functions/v1/update-shows',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuamVyc2pkZmhhbHZ6ZG1vcW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NDQ2OTgsImV4cCI6MjA2MDQyMDY5OH0.zr8cShSpb9T55LC2Y40_-Mbu5FTNdHXZEJyZ1lQxDN0"}'::jsonb,
    body:='{"action": "scheduled_update"}'::jsonb
  );
  $$
);