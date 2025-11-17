# Diagnostic Tests for Kinsta Shell

Run these commands in the Kinsta terminal to diagnose the deployment:

## Test 1: Check if files exist

```bash
ls -la /app/ | grep -E "(nginx|php-fpm|start-web)"
```

**Expected output:**
```
-rw-r--r-- 1 user user  XXX Nov 17 XX:XX nginx.conf
-rw-r--r-- 1 user user  XXX Nov 17 XX:XX php-fpm.conf
-rwxr-xr-x 1 user user  XXX Nov 17 XX:XX start-web.sh
```

---

## Test 2: Check if nginx command is available

```bash
which nginx
```

**Expected output:**
```
/nix/store/.../bin/nginx
```

If not found, nginx wasn't installed.

---

## Test 3: Check if php-fpm is available

```bash
which php-fpm
```

**Expected output:**
```
/nix/store/.../bin/php-fpm
```

---

## Test 4: Check what process is running

```bash
ps aux | grep -E "(nginx|php-fpm|reverb|php artisan)"
```

**Current behavior (wrong):**
Should show only `php artisan serve`

**Expected behavior (correct):**
Should show:
- nginx
- php-fpm
- php artisan reverb:start

---

## Test 5: Test if Reverb is listening internally

```bash
curl -v http://localhost:8080/
```

**If working:** Should get response from Reverb with "X-Powered-By: Laravel Reverb"
**If not working:** Connection refused or times out

---

## Test 6: Check what's listening on ports

```bash
netstat -tlnp 2>/dev/null || ss -tlnp
```

**Current (wrong):**
Should show only port 8080 with `php artisan serve`

**Expected (correct):**
- Port 8080 (Reverb - internal)
- Port 9000 (PHP-FPM - internal)
- Port $PORT (Nginx - external, usually 8080 or whatever Kinsta assigns)

---

## Test 7: Check environment variable

```bash
echo $PORT
```

Should show the port Kinsta assigned (usually 8080)

---

## Test 8: Manually test start-web.sh

**WARNING: This will disrupt the running service**

```bash
bash -x /app/start-web.sh
```

This runs the script in debug mode to see each command as it executes.

**Look for:**
- "Starting PHP-FPM..."
- "Starting Reverb WebSocket server..."
- "Starting Nginx on port..."
- Any error messages

Press Ctrl+C after you see output or errors.

---

## Results Format

Please share the output in this format:

```
Test 1 (files exist):
[paste output]

Test 2 (nginx available):
[paste output]

Test 3 (php-fpm available):
[paste output]

Test 4 (running processes):
[paste output]

Test 5 (Reverb response):
[paste output]

Test 6 (listening ports):
[paste output]
```
