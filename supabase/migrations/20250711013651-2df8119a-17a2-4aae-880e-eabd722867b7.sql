-- Check if the cron job is scheduled and active
SELECT * FROM cron.job WHERE jobname = 'auto-update-shows';

-- Check recent cron job run history
SELECT * FROM cron.job_run_details 
WHERE jobid IN (SELECT jobid FROM cron.job WHERE jobname = 'auto-update-shows')
ORDER BY start_time DESC 
LIMIT 10;

-- Also check if the extensions are properly enabled
SELECT * FROM pg_extension WHERE extname IN ('pg_cron', 'pg_net');