# Quick Check: What User Are We?

Run this in Kinsta terminal:

```bash
whoami && id
```

This will show the current user and their UID/GID.

---

**Common results:**
- `root` (UID 0) - Running as root
- `app` or similar - Custom application user
- A numeric UID - Unnamed user

Share the output and I'll configure PHP-FPM appropriately.
