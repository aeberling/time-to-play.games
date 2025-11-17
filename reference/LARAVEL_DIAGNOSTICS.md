# Laravel Diagnostics

Run these commands in Kinsta terminal to diagnose the 500 error:

## 1. Check Laravel logs (most important)

```bash
tail -100 /app/storage/logs/laravel.log
```

This should show the actual error causing the 500.

---

## 2. Test database connection

```bash
php artisan tinker --execute="DB::connection()->getPdo(); echo 'Database connected successfully';"
```

If this fails, database connection is the issue.

---

## 3. Check environment

```bash
php artisan about
```

Shows Laravel environment info, including database connection status.

---

## 4. Clear caches (if needed)

```bash
php artisan config:clear
php artisan cache:clear
php artisan view:clear
```

---

## 5. Check if APP_KEY is set

```bash
php artisan key:generate --show
```

Should show a base64 encoded key.

---

## 6. Test a simple route

```bash
curl http://localhost:8080/
```

Should return HTML (even if 500 error).

---

## Priority

Start with #1 (check laravel.log) - that will tell us exactly what's wrong.

If you can't access the terminal, I can add a route that displays the error for debugging.
