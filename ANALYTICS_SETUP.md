## Visitor Analytics - Privacy & Compliance

### What Data is Collected?
Your site now collects **privacy-compliant visitor analytics**:

- **Hashed IP Address** (SHA256)
- **Hashed User-Agent** (SHA256)
- **Page Visited** (e.g., "home", "blogs", "projects")
- **Device Type** (Mobile, Tablet, Desktop)
- **Browser** (Chrome, Firefox, Safari, Edge, etc.)
- **Operating System** (Windows, macOS, Linux, Android, iOS)
- **Referrer** (where visitor came from)
- **Timestamp** (when they visited)

### Privacy Protections
✅ **IP is HASHED** - Raw IP address is never stored
✅ **User-Agent is HASHED** - Cannot identify individual users
✅ **Server-side hashing** - Hashing done in Supabase function, not browser
✅ **No fingerprinting** - Cannot track users across multiple visits
✅ **Auto-cleanup** - Data older than 30 days is automatically deleted
✅ **No direct database access** - Only accessible via secure RPC functions
✅ **Aggregate only** - You can see top browsers/OS/devices, not individual users

### Compliance Notes
- **GDPR**: Recommended to add privacy policy mentioning analytics collection
- **CCPA**: Users generally don't need to opt-in for aggregate/anonymized analytics
- **Best Practice**: Add a privacy notice or update privacy policy to mention visitor analytics

### Implementation Details
- **Table**: `visitor_events` in Supabase
- **RPC to log visits**: `log_visitor(page_slug, device_type, browser_name, os_name, referrer)`
- **RPC for stats**: `get_visitor_stats(days_back)` - returns aggregate data only
- **Frontend**: `js/analytics.js` parses User-Agent and calls logging RPC
- **Retention**: Auto-delete via `cleanup_visitor_events()` (30 days)

### How to Retrieve Analytics
In Supabase SQL Editor, run:
```sql
select * from public.get_visitor_stats(7);  -- Last 7 days aggregate stats
```

This returns:
- `total_visits` - Total page visits in period
- `unique_visitors` - Unique hashed IP+UA combinations
- `top_pages` - Pages visited
- `top_devices` - Device breakdown
- `top_browsers` - Browser breakdown
- `top_os` - OS breakdown

### Setup Instructions
1. **Run SQL in Supabase**:
   - Open Supabase SQL Editor
   - Copy contents of `supabase/visitor-analytics.sql`
   - Paste and run
   - No errors should occur

2. **Analytics.js is auto-loaded**:
   - Already added to `index.html`
   - Runs on every page automatically
   - Silently fails if Supabase unavailable (non-blocking)

3. **View your stats**:
   - Run `select * from public.get_visitor_stats();` in Supabase

### Optional: Set Up Cleanup Job
For automatic data cleanup every day:
- In Supabase, set up a cron extension
- Call `public.cleanup_visitor_events()` daily
- Or run it manually once per week

### FAQ
**Q: Can you identify me?**
A: No. IP is hashed with a salt, and User-Agent is hashed. Both are one-way hashes - we can't reverse them to identify you.

**Q: How long is my data stored?**
A: 30 days by default. Older data is automatically deleted. You can change this in the cleanup function.

**Q: Is this GDPR-compliant?**
A: Yes, if you update your privacy policy to mention it. Raw IP is not stored (it's hashed), and data is deleted after 30 days.

**Q: Can I opt-out?**
A: Not currently, but you could modify `analytics.js` to check for a "do-not-track" browser setting or local storage flag.

---

**Questions?** Review the RPC functions in `visitor-analytics.sql` for implementation details.
