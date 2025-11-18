# Check Laravel Logs

Run these commands in the Kinsta terminal to see what Laravel error is causing the 500:

## Check the latest Laravel log

```bash
tail -50 /app/storage/logs/laravel.log
```

This will show the last 50 lines of the Laravel log, which should contain the actual error.

---

## Alternative: Check all logs in storage

```bash
ls -la /app/storage/logs/
cat /app/storage/logs/laravel.log
```

---

## Check PHP-FPM error log

The runtime logs show PHP errors go to stderr, so check the Kinsta runtime logs for any PHP errors starting with "WARNING: [pool www]".

---

## Common Issues to Look For

1. **Database connection** - Check if database credentials are correct
2. **Missing environment variable** - Check if all .env variables are set
3. **Cache/config issues** - May need to run `php artisan config:clear`
4. **Missing APP_KEY** - Laravel encryption key not set

---

Please share the output from the laravel.log file.
