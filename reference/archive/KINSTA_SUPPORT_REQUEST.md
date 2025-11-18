# Kinsta Support Request: Laravel Reverb WebSocket TLS Issue

## Summary

I'm trying to deploy Laravel Reverb (WebSocket server) on Kinsta Application Hosting using the recommended architecture of a Background Worker + TCP Proxy, but WebSocket connections are failing due to what appears to be a TLS/SSL configuration issue.

## Current Setup

Following Kinsta's documentation (https://kinsta.com/docs/application-hosting/application-connections/), I have configured:

1. **Web Process**: Running Laravel application on port 8080
2. **Background Worker**: Running `php artisan reverb:start --host=0.0.0.0 --port=8080`
   - Process name: `reverb`
   - Status: Running successfully
3. **TCP Proxy**: Configured to expose the reverb background worker
   - Process: reverb
   - Internal port: 8080
   - External endpoint: `us-west4-001.proxy.kinsta.app:30814`

## The Problem

WebSocket connections from browsers fail with error code 1006 (abnormal closure) after approximately 46 seconds.

## Testing Results

I've confirmed that Reverb is working correctly:

**Test 1 - HTTP Response:**
```bash
curl -v http://localhost:8080/
# Result: HTTP/1.1 404 Not Found, X-Powered-By: Laravel Reverb
# ✅ Reverb is running and responding
```

**Test 2 - WebSocket Upgrade:**
```bash
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: test" \
  http://localhost:8080/app/5fe7c22bad16f626d3fb296f

# Result: Reverb responds with Pusher protocol data
# ✅ Reverb handles WebSocket upgrades correctly
```

## Root Cause Analysis

The issue appears to be TLS/SSL related:

- Browsers connect via `wss://` (WebSocket Secure - encrypted)
- Reverb is configured for plain HTTP WebSocket connections
- The TCP proxy appears to do **TLS passthrough** (forwards encrypted traffic as-is)
- Reverb receives encrypted data but expects plain HTTP, causing connection failures

## What I Need Help With

**Question 1:** Does Kinsta's TCP Proxy support TLS termination for WebSocket connections?

If yes, how do I enable it? If no, how should I configure Laravel Reverb to handle TLS directly?

**Question 2:** Are there any examples or documentation for deploying Laravel Reverb with secure WebSocket (WSS) connections on Kinsta?

**Question 3:** What is the recommended architecture for running Laravel Reverb on Kinsta Application Hosting when browsers need to connect via `wss://` (HTTPS context)?

## Environment Details

- Application: Laravel 11.x with Reverb
- Kinsta Region: us-west4
- TCP Proxy Endpoint: `us-west4-001.proxy.kinsta.app:30814`
- Reverb Version: Latest (installed via Composer)

## Expected Behavior

Browsers should be able to connect to:
```
wss://us-west4-001.proxy.kinsta.app:30814/app/[app-key]
```

And establish a persistent WebSocket connection for real-time communication.

## Additional Context

I've followed the architecture described in your documentation that states: "You can also use [TCP proxy] to deploy a Laravel app with Reverb (a WebSocket server) as a single application, with Reverb running as a background worker while still being publicly accessible."

Both processes (web and reverb) are running successfully, but the TLS layer seems to be preventing proper WebSocket connections.

Thank you for your help!
