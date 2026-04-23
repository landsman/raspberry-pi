vcl 4.1;

# NOTE: ${VARIABLE} placeholders in this file are not read by Varnish directly.
# entrypoint.sh runs envsubst at container startup to substitute them with real values
# before Varnish loads the config. Editing this file alone has no effect until the
# container is restarted.

# External IPs allowed to send PURGE and BAN (workflow, your public IPs)
acl purge_allowed {
    "localhost";
    "127.0.0.1";
${VARNISH_PURGE_IPS_ACL}}

# Internal Docker network — CMS and other backend services on the same compose network
acl purge_allowed_internal {
    "172.16.0.0"/12;
}

backend default {
    .host = "nginx";
    .port = "8080";

    # Health check Varnish runs continuously in the background.
    .probe = {
        # Send GET / to check if the backend is alive.
        .url = "/";
        # Run the check every 5 seconds.
        .interval = 5s;
        # If nginx doesn't respond within 2 seconds, count it as a failure.
        .timeout = 2s;
        # Look at the last 5 health checks.
        .window = 5;
        # Backend is healthy if at least 3 out of the last 5 checks passed.
        # If it falls below this, Varnish marks it unhealthy and serves stale
        # cached content (within grace period) instead of forwarding to a broken backend.
        .threshold = 3;
    }
}

sub vcl_recv {
    # CVE-2025-29927: attackers send this header to bypass Next.js middleware auth.
    # Strip it from all incoming requests before they reach the backend.
    unset req.http.X-Middleware-Subrequest;

    if (req.method == "PURGE") {
        # Internal services (CMS etc.) use their own token and can only PURGE exact URLs
        if (client.ip ~ purge_allowed_internal) {
            if (req.http.X-Purge-Token != "${VARNISH_PURGE_TOKEN_CMS}") {
                return (synth(403, "Forbidden"));
            }
            return (purge);
        }

        # External (workflow, public IPs) use the main token
        if (!client.ip ~ purge_allowed) {
            return (synth(403, "Forbidden"));
        }
        if (req.http.X-Purge-Token != "${VARNISH_PURGE_TOKEN}") {
            return (synth(403, "Forbidden"));
        }
        return (purge);
    }

    # BAN is restricted to external purge_allowed only — internal services cannot wildcard ban
    if (req.method == "BAN") {
        if (!client.ip ~ purge_allowed) {
            return (synth(403, "Forbidden"));
        }
        if (req.http.X-Purge-Token != "${VARNISH_PURGE_TOKEN}") {
            return (synth(403, "Forbidden"));
        }
        ban("req.url ~ " + req.http.X-Ban-Pattern);
        return (synth(200, "Banned"));
    }

    if (req.method != "GET" && req.method != "HEAD") {
        return (pass);
    }

    if (req.http.Authorization || req.http.Cookie) {
        return (pass);
    }

    # Strip query parameters from static assets so e.g. /video.mp4?v=1 and
    # /video.mp4?t=1234 resolve to the same cache entry instead of being stored separately.
    # css, js, woff, woff2, ttf are intentionally excluded — frontend builds use query params
    # as version hashes (e.g. /app.js?v=abc123) so each value is a distinct file.
    if (req.url ~ "\.(mp4|mp3|mov|webm|jpg|jpeg|png|gif|webp|svg|ico)\?") {
        set req.url = regsub(req.url, "\?.*$", "");
    }

    # Frontend paths that should never be cached — always fetch fresh from the app.
    # Add any route that is user-specific, auth-protected, or must not be shared across users.
    if (req.url ~ "^/dashboard" ||  # user dashboard
        req.url ~ "^/admin" ||      # admin panel
        req.url ~ "^/login" ||      # login page (may contain CSRF tokens)
        req.url ~ "^/logout" ||     # logout (must always execute)
        req.url ~ "^/account" ||    # user account / profile
        req.url ~ "^/checkout" ||   # checkout flow
        req.url ~ "^/cart") {       # shopping cart
        return (pass);
    }
}

sub vcl_synth {
    set resp.http.Content-Type = "application/json";

    # VCL long strings {"..."} terminate at "} — the same two chars that close a JSON
    # object whose last value is a string. There is no \" escape in VCL strings.
    # Solution: end every JSON body with a boolean so the last chars are e.g. true}
    # and put dynamic string values (url, message) in response headers instead.
    if (resp.status == 200) {
        set resp.http.X-Url = req.url;
        synthetic({"{"status":"purged","ok":true}"});
    } else if (resp.status == 404) {
        set resp.http.X-Url = req.url;
        synthetic({"{"status":"not_in_cache","ok":false}"});
    } else if (resp.status == 403) {
        synthetic({"{"status":"forbidden","ok":false}"});
    } else {
        set resp.http.X-Message = resp.reason;
        synthetic({"{"status":"error","ok":false}"});
    }

    return (deliver);
}

sub vcl_backend_response {
    # Cache the response for 5 minutes. After that it is considered stale.
    set beresp.ttl = 5m;

    # If the TTL has expired but a fresh copy hasn't been fetched yet (e.g. backend is slow
    # or down), keep serving the stale cached response for up to 1 extra minute rather than
    # making the user wait. Object is fully gone after 6 minutes total (ttl + grace).
    set beresp.grace = 1m;
}

sub vcl_deliver {
    # Strip headers that fingerprint the infrastructure. Attackers can use these
    # to identify software versions and tailor exploits accordingly.
    if ("${VARNISH_DEBUG}" != "true") {
        # Added by Varnish — exposes internal cache object IDs and reveals Varnish is in use.
        unset resp.http.X-Varnish;
        # Added by Varnish — reveals the proxy chain (e.g. "1.1 varnish (Varnish/7.x)").
        unset resp.http.Via;
        # Added by Varnish — leaks how long the object has been sitting in cache.
        unset resp.http.Age;
        # Set by nginx — reveals the backend software and version.
        unset resp.http.Server;
        # Set by some backend frameworks (PHP, Node.js, Next.js) — reveals runtime and version.
        unset resp.http.X-Powered-By;
        # Next.js — reveals internal caching state (HIT, MISS, STALE, BYPASS).
        unset resp.http.X-Nextjs-Cache;
        # Next.js — exposes internal route patterns e.g. /[slug], /api/[...path].
        unset resp.http.X-Nextjs-Matched-Path;
        unset resp.http.X-Matched-Path;
        # Next.js — leaks internal rewritten paths and middleware query parameters.
        unset resp.http.X-Middleware-Rewrite;
        # Next.js — reveals that Edge Middleware is in use.
        unset resp.http.X-Middleware-Next;
        unset resp.http.X-Middleware-Redirect;
        # Next.js — leaks redirect targets from middleware or the router.
        unset resp.http.X-Nextjs-Redirect;
        # Older Next.js versions used this instead of X-Nextjs-Cache.
        unset resp.http.X-Next-Cache;
        # Added by response-time middleware (Express/Koa) — leaks backend processing time,
        # useful for timing attacks.
        unset resp.http.X-Response-Time;
        # Added by various Node.js frameworks — leaks internal UUIDs or sequential IDs
        # that can reveal request volume or system architecture.
        unset resp.http.X-Request-Id;
    }

    # X-Cache reveals caching behaviour to the client — useful for debugging but
    # exposes information to attackers in production.
    # Check it with: curl -I https://yoursite.com
    if ("${VARNISH_DEBUG}" == "true") {
        if (obj.hits > 0) {
            set resp.http.X-Cache = "HIT";
        } else {
            set resp.http.X-Cache = "MISS";
        }
    }
}
